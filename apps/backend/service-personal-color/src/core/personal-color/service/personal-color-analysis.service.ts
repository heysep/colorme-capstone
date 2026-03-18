/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CommonError,
  IDefaultOutputDto,
  ObjectStorageDownloadService,
  ObjectStorageUploadService,
  PcAnalysisStatus,
  RnDefaultPcAnalysisEntity,
  RnDefaultPcUserEntity,
  RnDefaultPersonalColorEntity,
  RnDefaultUploadFileEntity,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalColorError } from '../error/personal-color.error';
import {
  PcAnalysisDetailResponseDto,
  PcAnalyzeUploadResponseDto,
} from '../dto/personal-color.dto';
import {
  PcPalette,
  PcSeasonCode,
  PcSeasonScoreMap,
} from '../types/personal-color.types';
import { GeminiPersonalColorProviderService } from './gemini-personal-color-provider.service';
import { PersonalColorGuestSessionService } from './personal-color-guest-session.service';
import { PersonalColorStylingService } from './personal-color-styling.service';
import { PersonalColorToneScoringService } from './personal-color-tone-scoring.service';
import { PersonalColorUrlService } from './personal-color-url.service';

@Injectable()
export class PersonalColorAnalysisService {
  constructor(
    @InjectRepository(RnDefaultPcAnalysisEntity)
    private readonly analysisRepository: Repository<RnDefaultPcAnalysisEntity>,
    @InjectRepository(RnDefaultPersonalColorEntity)
    private readonly personalColorRepository: Repository<RnDefaultPersonalColorEntity>,
    @InjectRepository(RnDefaultPcUserEntity)
    private readonly pcUserRepository: Repository<RnDefaultPcUserEntity>,
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    private readonly objectStorageUploadService: ObjectStorageUploadService,
    private readonly objectStorageDownloadService: ObjectStorageDownloadService,
    private readonly personalColorGuestSessionService: PersonalColorGuestSessionService,
    private readonly geminiPersonalColorProviderService: GeminiPersonalColorProviderService,
    private readonly personalColorToneScoringService: PersonalColorToneScoringService,
    private readonly personalColorStylingService: PersonalColorStylingService,
    private readonly personalColorUrlService: PersonalColorUrlService,
  ) {}

  async uploadForAnalysis(options: {
    file: Express.Multer.File | undefined;
    sessionToken?: string;
    uploaderIp: string;
  }): Promise<IDefaultOutputDto<PcAnalyzeUploadResponseDto>> {
    const { file } = options;
    if (!file || !file.buffer) {
      throw CommonError.createByErrorCode(PersonalColorError.INVALID_IMAGE_FILE);
    }

    if (!this.isSupportedImage(file)) {
      throw CommonError.createByErrorCode(PersonalColorError.INVALID_IMAGE_FILE);
    }

    const sessionUser =
      await this.personalColorGuestSessionService.getOrCreateGuestSession(
        options.sessionToken,
      );

    const uploadResult = await this.objectStorageUploadService.uploadFile({
      file,
      fileName: this.objectStorageUploadService.randomFileKeyGenerate(),
      uploader: sessionUser.data.id.toString(),
      uploaderDetail: sessionUser.data.sessionToken,
      uploaderIp: options.uploaderIp,
      isTenantUser: false,
      description: '퍼스널 컬러 분석용 얼굴 이미지',
    });

    const uploadEntity = uploadResult.data.uploadEntityResult;
    const analysis = await this.analysisRepository.save({
      user: sessionUser.data,
      personalColor: null,
      status: PcAnalysisStatus.ANALYZING,
      uploadFileId: uploadEntity.id,
      originalImageUrl: this.personalColorUrlService.buildFileDownloadUrl(
        uploadEntity.storageName,
      ),
      reason: null,
      primaryConfidence: null,
      seasonScores: null,
      distribution: null,
      toneSignals: null,
      gender: null,
      analysisProvider: 'GEMINI',
      analysisError: null,
    });

    void this.processAnalysisInBackground(analysis.id).catch(async (error) => {
      await this.markAnalysisAsFailed(
        analysis.id,
        error instanceof Error ? error.message : '분석 처리 중 알 수 없는 오류가 발생했습니다.',
      );
    });

    return IDefaultOutputDto.success({
      sessionToken: sessionUser.data.sessionToken,
      analysisId: analysis.id,
      status: analysis.status,
    });
  }

  async getAnalysisDetail(options: {
    sessionToken?: string;
    analysisId: number;
  }): Promise<IDefaultOutputDto<PcAnalysisDetailResponseDto>> {
    const sessionUser =
      await this.personalColorGuestSessionService.getRequiredSessionUser(
        options.sessionToken,
      );
    const analysis = await this.analysisRepository.findOne({
      where: {
        id: options.analysisId,
      },
      relations: {
        user: true,
        personalColor: true,
      },
    });

    if (!analysis) {
      throw CommonError.createByErrorCode(PersonalColorError.ANALYSIS_NOT_FOUND);
    }
    if (analysis.user.id !== sessionUser.data.id) {
      throw CommonError.createByErrorCode(
        PersonalColorError.ANALYSIS_ACCESS_DENIED,
      );
    }

    const seasonCode = this.resolveSeasonCode(analysis);
    const recommendations =
      analysis.status === PcAnalysisStatus.COMPLETED && seasonCode
        ? await this.personalColorStylingService.buildRecommendations({
            seasonCode,
            estimatedGender: analysis.gender,
            palette: (analysis.personalColor?.palette ?? null) as PcPalette | null,
            seasonScores: (analysis.seasonScores ??
              this.emptySeasonScores()) as PcSeasonScoreMap,
          })
        : null;

    const rejectionReasons = Array.isArray(analysis.toneSignals?.rejectionReasons)
      ? (analysis.toneSignals?.rejectionReasons as string[])
      : [];

    return IDefaultOutputDto.success({
      analysisId: analysis.id,
      status: analysis.status,
      seasonCode,
      seasonName: this.getSeasonName(analysis, seasonCode),
      reason: analysis.reason,
      primaryConfidence: analysis.primaryConfidence,
      seasonScores: analysis.seasonScores as Record<string, number> | null,
      estimatedGender: analysis.gender,
      palette: (analysis.personalColor?.palette ?? null) as PcPalette | null,
      recommendations,
      retryGuide:
        analysis.status === PcAnalysisStatus.FAILED
          ? this.personalColorToneScoringService.buildRetryGuide(
              rejectionReasons,
            )
          : null,
    });
  }

  private async processAnalysisInBackground(analysisId: number) {
    const analysis = await this.analysisRepository.findOne({
      where: {
        id: analysisId,
      },
      relations: {
        user: true,
        personalColor: true,
      },
    });

    if (!analysis) {
      throw CommonError.createByErrorCode(PersonalColorError.ANALYSIS_NOT_FOUND);
    }

    const uploadFile = await this.uploadFileRepository.findOne({
      where: {
        id: analysis.uploadFileId ?? '',
      },
    });

    if (!uploadFile) {
      throw CommonError.createByErrorCode(PersonalColorError.INVALID_IMAGE_FILE);
    }

    const downloadResult = await this.objectStorageDownloadService.downloadFile({
      storageName: uploadFile.storageName,
    });
    const faceBuffer = await this.streamToBuffer(downloadResult.data.fileStream);
    const providerResult =
      await this.geminiPersonalColorProviderService.analyzeFace({
        buffer: faceBuffer,
        mimeType: uploadFile.type,
      });

    analysis.toneSignals = providerResult as any;
    analysis.gender = providerResult.estimatedGender;
    analysis.reason = providerResult.reasoning;
    analysis.analysisProvider = 'GEMINI';

    if (!providerResult.canAnalyze) {
      analysis.status = PcAnalysisStatus.FAILED;
      analysis.analysisError =
        providerResult.rejectionReasons.join(' ') ||
        '분석 가능한 얼굴 사진을 확인하지 못했습니다.';
      await this.analysisRepository.save(analysis);
      return;
    }

    const scoredResult =
      this.personalColorToneScoringService.scoreSeason(providerResult);
    const personalColor = await this.personalColorRepository.findOne({
      where: {
        seasonCode: scoredResult.seasonCode,
      },
    });

    analysis.personalColor = personalColor ?? null;
    analysis.primaryConfidence = scoredResult.primaryConfidence;
    analysis.seasonScores = scoredResult.seasonScores;
    analysis.distribution = scoredResult.seasonScores as Record<string, number>;
    analysis.status = PcAnalysisStatus.COMPLETED;
    analysis.analysisError = null;
    analysis.originalImageUrl = this.personalColorUrlService.buildFileDownloadUrl(
      uploadFile.storageName,
    );

    await this.analysisRepository.save(analysis);

    analysis.user.personalColor = personalColor ?? null;
    await this.pcUserRepository.save(analysis.user);
  }

  private async markAnalysisAsFailed(analysisId: number, message: string) {
    await this.analysisRepository.update(
      {
        id: analysisId,
      },
      {
        status: PcAnalysisStatus.FAILED,
        analysisError: message,
        analysisProvider: 'GEMINI',
      },
    );
  }

  private isSupportedImage(file: Express.Multer.File) {
    return file.mimetype.startsWith('image/') && file.size <= 10 * 1024 * 1024;
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private resolveSeasonCode(
    analysis: RnDefaultPcAnalysisEntity,
  ): PcSeasonCode | null {
    if (analysis.personalColor?.seasonCode) {
      return analysis.personalColor.seasonCode as PcSeasonCode;
    }

    const seasonScores = analysis.seasonScores as Record<string, number> | null;
    if (!seasonScores) {
      return null;
    }

    const sorted = Object.entries(seasonScores).sort((a, b) => b[1] - a[1]);
    return (sorted[0]?.[0] as PcSeasonCode | undefined) ?? null;
  }

  private getSeasonName(
    analysis: RnDefaultPcAnalysisEntity,
    seasonCode: PcSeasonCode | null,
  ) {
    if (analysis.personalColor?.seasonName) {
      return analysis.personalColor.seasonName;
    }

    if (!seasonCode) {
      return null;
    }

    const seasonLabelMap: Record<PcSeasonCode, string> = {
      [PcSeasonCode.SPRING_WARM]: '봄 웜톤',
      [PcSeasonCode.SUMMER_COOL]: '여름 쿨톤',
      [PcSeasonCode.AUTUMN_WARM]: '가을 웜톤',
      [PcSeasonCode.WINTER_COOL]: '겨울 쿨톤',
    };

    return seasonLabelMap[seasonCode];
  }

  private emptySeasonScores(): PcSeasonScoreMap {
    return {
      [PcSeasonCode.SPRING_WARM]: 0,
      [PcSeasonCode.SUMMER_COOL]: 0,
      [PcSeasonCode.AUTUMN_WARM]: 0,
      [PcSeasonCode.WINTER_COOL]: 0,
    };
  }
}

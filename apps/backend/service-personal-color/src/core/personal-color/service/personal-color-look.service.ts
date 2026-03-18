/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CommonError,
  IDefaultOutputDto,
  ObjectStorageDownloadService,
  ObjectStorageUploadService,
  PcAnalysisStatus,
  PcSavedLookStatus,
  RnDefaultPcAnalysisEntity,
  RnDefaultPcSavedLookEntity,
  RnDefaultUploadFileEntity,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PcLookDetailResponseDto,
  PcSaveLookResponseDto,
  PcSelectedLookItemsDto,
  PcShareLookResponseDto,
  PcSharedLookResponseDto,
  PcTryOnRequestDto,
  PcTryOnResponseDto,
} from '../dto/personal-color.dto';
import { PersonalColorError } from '../error/personal-color.error';
import { PcPalette, PcSeasonCode } from '../types/personal-color.types';
import { GeminiTryOnProviderService } from './gemini-try-on-provider.service';
import { PersonalColorCatalogService } from './personal-color-catalog.service';
import { PersonalColorGuestSessionService } from './personal-color-guest-session.service';
import { PersonalColorShareService } from './personal-color-share.service';
import { PersonalColorStylingService } from './personal-color-styling.service';
import { PersonalColorUrlService } from './personal-color-url.service';

@Injectable()
export class PersonalColorLookService {
  constructor(
    @InjectRepository(RnDefaultPcSavedLookEntity)
    private readonly savedLookRepository: Repository<RnDefaultPcSavedLookEntity>,
    @InjectRepository(RnDefaultPcAnalysisEntity)
    private readonly analysisRepository: Repository<RnDefaultPcAnalysisEntity>,
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    private readonly personalColorGuestSessionService: PersonalColorGuestSessionService,
    private readonly personalColorCatalogService: PersonalColorCatalogService,
    private readonly personalColorStylingService: PersonalColorStylingService,
    private readonly geminiTryOnProviderService: GeminiTryOnProviderService,
    private readonly objectStorageUploadService: ObjectStorageUploadService,
    private readonly objectStorageDownloadService: ObjectStorageDownloadService,
    private readonly personalColorShareService: PersonalColorShareService,
    private readonly personalColorUrlService: PersonalColorUrlService,
  ) {}

  async createTryOn(options: {
    sessionToken?: string;
    body: PcTryOnRequestDto;
  }): Promise<IDefaultOutputDto<PcTryOnResponseDto>> {
    const sessionUser =
      await this.personalColorGuestSessionService.getRequiredSessionUser(
        options.sessionToken,
      );
    const analysis = await this.analysisRepository.findOne({
      where: {
        id: options.body.analysisId,
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
    if (analysis.status !== PcAnalysisStatus.COMPLETED) {
      throw CommonError.createByErrorCode(
        PersonalColorError.ANALYSIS_NOT_COMPLETED,
      );
    }

    const selectedItems =
      await this.personalColorCatalogService.getRequiredCatalogSelection({
        topItemId: options.body.topItemId,
        bottomItemId: options.body.bottomItemId,
        accessoryItemId: options.body.accessoryItemId,
      });

    const recommendations =
      await this.personalColorStylingService.buildRecommendations({
        seasonCode: this.resolveSeasonCode(analysis),
        estimatedGender: analysis.gender,
        palette: (analysis.personalColor?.palette ?? null) as PcPalette | null,
        seasonScores: analysis.seasonScores as any,
      });

    const look = await this.savedLookRepository.save({
      user: sessionUser.data,
      analysis,
      tryOnImageUrl: null,
      status: PcSavedLookStatus.TRYON_PENDING,
      selectedItemIds: {
        topItemId: selectedItems.top.itemId,
        bottomItemId: selectedItems.bottom.itemId,
        accessoryItemId: selectedItems.accessory?.itemId ?? null,
      },
      recommendationSnapshot: recommendations as any,
      providerJobId: null,
      providerName: 'GEMINI',
      shareToken: null,
      savedYn: false,
      description: null,
    });

    void this.processLookInBackground(look.id).catch(async () => {
      await this.savedLookRepository.update(
        {
          id: look.id,
        },
        {
          status: PcSavedLookStatus.FAILED,
        },
      );
    });

    return IDefaultOutputDto.success({
      lookId: look.id,
      status: look.status,
    });
  }

  async getLookDetail(options: {
    sessionToken?: string;
    lookId: number;
  }): Promise<IDefaultOutputDto<PcLookDetailResponseDto>> {
    const look = await this.getOwnedLook(options.lookId, options.sessionToken);

    return IDefaultOutputDto.success({
      lookId: look.id,
      status: look.status,
      tryOnImageUrl: look.tryOnImageUrl,
      selectedItems: await this.buildSelectedItemsResponse(look),
      savedYn: look.savedYn,
    });
  }

  async saveLook(options: {
    sessionToken?: string;
    lookId: number;
    description?: string;
  }): Promise<IDefaultOutputDto<PcSaveLookResponseDto>> {
    const look = await this.getOwnedLook(options.lookId, options.sessionToken);

    look.savedYn = true;
    if (options.description !== undefined) {
      look.description = options.description;
    }

    await this.savedLookRepository.save(look);

    return IDefaultOutputDto.success({
      lookId: look.id,
      savedYn: look.savedYn,
    });
  }

  async shareLook(options: {
    sessionToken?: string;
    lookId: number;
  }): Promise<IDefaultOutputDto<PcShareLookResponseDto>> {
    const look = await this.getOwnedLook(options.lookId, options.sessionToken);

    if (!look.shareToken) {
      look.shareToken = this.personalColorShareService.createShareToken();
      await this.savedLookRepository.save(look);
    }

    return IDefaultOutputDto.success({
      lookId: look.id,
      shareToken: look.shareToken,
      shareUrl: this.personalColorShareService.buildShareUrl(look.shareToken),
    });
  }

  async getSharedLook(options: {
    shareToken: string;
  }): Promise<IDefaultOutputDto<PcSharedLookResponseDto>> {
    const look = await this.savedLookRepository.findOne({
      where: {
        shareToken: options.shareToken,
      },
      relations: {
        analysis: {
          personalColor: true,
        },
      },
    });

    if (!look) {
      throw CommonError.createByErrorCode(PersonalColorError.SHARE_NOT_FOUND);
    }

    return IDefaultOutputDto.success({
      lookId: look.id,
      seasonCode: this.resolveSeasonCode(look.analysis),
      seasonName: this.getSeasonName(look.analysis),
      tryOnImageUrl: look.tryOnImageUrl,
      selectedItems: await this.buildSelectedItemsResponse(look),
      palette: (look.analysis.personalColor?.palette ?? null) as PcPalette | null,
    });
  }

  private async getOwnedLook(lookId: number, sessionToken?: string) {
    const sessionUser =
      await this.personalColorGuestSessionService.getRequiredSessionUser(
        sessionToken,
      );
    const look = await this.savedLookRepository.findOne({
      where: {
        id: lookId,
      },
      relations: {
        user: true,
        analysis: {
          personalColor: true,
        },
      },
    });

    if (!look) {
      throw CommonError.createByErrorCode(PersonalColorError.LOOK_NOT_FOUND);
    }
    if (look.user.id !== sessionUser.data.id) {
      throw CommonError.createByErrorCode(PersonalColorError.LOOK_ACCESS_DENIED);
    }

    return look;
  }

  private async processLookInBackground(lookId: number) {
    const look = await this.savedLookRepository.findOne({
      where: {
        id: lookId,
      },
      relations: {
        user: true,
        analysis: {
          personalColor: true,
        },
      },
    });

    if (!look) {
      throw CommonError.createByErrorCode(PersonalColorError.LOOK_NOT_FOUND);
    }

    const selectedItemIds = (look.selectedItemIds ?? {}) as Record<string, number>;
    const selectedItems =
      await this.personalColorCatalogService.getRequiredCatalogSelection({
        topItemId: selectedItemIds.topItemId,
        bottomItemId: selectedItemIds.bottomItemId,
        accessoryItemId: selectedItemIds.accessoryItemId,
      });

    const personFile = await this.getUploadFileBufferById(
      look.analysis.uploadFileId ?? '',
    );
    const topFile = await this.getUploadFileBufferById(selectedItems.top.imageFileId);
    const bottomFile = await this.getUploadFileBufferById(
      selectedItems.bottom.imageFileId,
    );
    const accessoryFile = selectedItems.accessory
      ? await this.getUploadFileBufferById(selectedItems.accessory.imageFileId)
      : null;

    look.status = PcSavedLookStatus.TRYON_PROCESSING;
    await this.savedLookRepository.save(look);

    const tryOnResult = await this.geminiTryOnProviderService.generateTryOn({
      personImage: personFile,
      topImage: {
        ...topFile,
        name: selectedItems.top.name,
      },
      bottomImage: {
        ...bottomFile,
        name: selectedItems.bottom.name,
      },
      accessoryImage: selectedItems.accessory
        ? {
            ...accessoryFile!,
            name: selectedItems.accessory.name,
          }
        : null,
      seasonName: this.getSeasonName(look.analysis),
      analysisReason: look.analysis.reason,
      palette: (look.analysis.personalColor?.palette ?? null) as PcPalette | null,
    });

    const uploadedResult = await this.objectStorageUploadService.uploadFile({
      file: this.createMulterFileFromBuffer(
        tryOnResult.buffer,
        `tryon-${look.id}.png`,
        tryOnResult.mimeType,
      ),
      fileName: this.objectStorageUploadService.randomFileKeyGenerate(),
      uploader: look.user.id.toString(),
      uploaderDetail: look.user.sessionToken,
      uploaderIp: 'SYSTEM',
      isTenantUser: false,
      description: '퍼스널 컬러 가상 피팅 결과 이미지',
    });

    look.providerJobId = tryOnResult.providerJobId;
    look.providerName = 'GEMINI';
    look.status = PcSavedLookStatus.TRYON_COMPLETED;
    look.tryOnImageUrl = this.personalColorUrlService.buildFileDownloadUrl(
      uploadedResult.data.uploadEntityResult.storageName,
    );

    await this.savedLookRepository.save(look);
  }

  private async getUploadFileBufferById(fileId: string) {
    const uploadFile = await this.uploadFileRepository.findOne({
      where: {
        id: fileId,
      },
    });

    if (!uploadFile) {
      throw CommonError.createByErrorCode(PersonalColorError.CATALOG_ITEM_NOT_FOUND);
    }

    const downloadResult = await this.objectStorageDownloadService.downloadFile({
      storageName: uploadFile.storageName,
    });

    return {
      mimeType: uploadFile.type,
      buffer: await this.streamToBuffer(downloadResult.data.fileStream),
    };
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private createMulterFileFromBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: mimeType,
      size: buffer.length,
      destination: '',
      filename: fileName,
      path: '',
      buffer,
      stream: undefined as any,
    };
  }

  private async buildSelectedItemsResponse(
    look: RnDefaultPcSavedLookEntity,
  ): Promise<PcSelectedLookItemsDto> {
    const selectedItemIds = (look.selectedItemIds ?? {}) as Record<string, number>;
    const selectedItems =
      await this.personalColorCatalogService.getRequiredCatalogSelection({
        topItemId: selectedItemIds.topItemId,
        bottomItemId: selectedItemIds.bottomItemId,
        accessoryItemId: selectedItemIds.accessoryItemId,
      });

    return {
      top: {
        itemId: selectedItems.top.itemId,
        name: selectedItems.top.name,
        imageUrl: selectedItems.top.imageUrl,
        dominantColorHex: selectedItems.top.dominantColorHex,
        styleTags: selectedItems.top.styleTags,
      },
      bottom: {
        itemId: selectedItems.bottom.itemId,
        name: selectedItems.bottom.name,
        imageUrl: selectedItems.bottom.imageUrl,
        dominantColorHex: selectedItems.bottom.dominantColorHex,
        styleTags: selectedItems.bottom.styleTags,
      },
      accessory: selectedItems.accessory
        ? {
            itemId: selectedItems.accessory.itemId,
            name: selectedItems.accessory.name,
            imageUrl: selectedItems.accessory.imageUrl,
            dominantColorHex: selectedItems.accessory.dominantColorHex,
            styleTags: selectedItems.accessory.styleTags,
          }
        : null,
    };
  }

  private resolveSeasonCode(
    analysis: RnDefaultPcAnalysisEntity,
  ): PcSeasonCode {
    if (analysis.personalColor?.seasonCode) {
      return analysis.personalColor.seasonCode as PcSeasonCode;
    }

    const sorted = Object.entries(
      (analysis.seasonScores ?? {}) as Record<string, number>,
    ).sort((a, b) => b[1] - a[1]);

    return (sorted[0]?.[0] as PcSeasonCode | undefined) ?? PcSeasonCode.SPRING_WARM;
  }

  private getSeasonName(analysis: RnDefaultPcAnalysisEntity) {
    if (analysis.personalColor?.seasonName) {
      return analysis.personalColor.seasonName;
    }

    const labelMap: Record<PcSeasonCode, string> = {
      [PcSeasonCode.SPRING_WARM]: '봄 웜톤',
      [PcSeasonCode.SUMMER_COOL]: '여름 쿨톤',
      [PcSeasonCode.AUTUMN_WARM]: '가을 웜톤',
      [PcSeasonCode.WINTER_COOL]: '겨울 쿨톤',
    };

    return labelMap[this.resolveSeasonCode(analysis)];
  }
}

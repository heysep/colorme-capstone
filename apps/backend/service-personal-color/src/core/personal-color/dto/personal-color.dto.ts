import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from '@capstone-project/glb-commons';
import {
  PcEstimatedGender,
  PcSeasonCode,
} from '../types/personal-color.types';

export class PcPaletteColorDto {
  @ApiProperty({ description: '색상 라벨', example: '코랄' })
  label: string;

  @ApiProperty({ description: 'HEX 색상값', example: '#FF7F50' })
  hex: string;
}

export class PcPaletteDto {
  @ApiProperty({
    description: '추천 컬러 팔레트',
    type: () => PcPaletteColorDto,
    isArray: true,
  })
  colors: PcPaletteColorDto[];
}

export class PcRecommendedCatalogItemDto {
  @ApiProperty({ description: '카탈로그 아이템 ID', example: 1 })
  itemId: number;

  @ApiProperty({ description: '카탈로그 아이템 이름', example: '코랄 블라우스' })
  name: string;

  @ApiProperty({
    description: '카탈로그 이미지 URL',
    example: '/service-file-mng/v1/every/file-manager/download/storage-name',
  })
  imageUrl: string;

  @ApiPropertyOptional({
    description: '대표 색상 HEX',
    example: '#FF7F50',
    nullable: true,
  })
  dominantColorHex: string | null;

  @ApiProperty({
    description: '스타일 태그',
    isArray: true,
    type: String,
    example: ['soft', 'romantic'],
  })
  styleTags: string[];

  @ApiProperty({ description: '추천 이유', example: '봄 웜톤 팔레트와 잘 어울립니다.' })
  reason: string;
}

export class PcRecommendationsDto {
  @ApiProperty({
    description: '상의 추천',
    type: () => PcRecommendedCatalogItemDto,
    isArray: true,
  })
  tops: PcRecommendedCatalogItemDto[];

  @ApiProperty({
    description: '하의 추천',
    type: () => PcRecommendedCatalogItemDto,
    isArray: true,
  })
  bottoms: PcRecommendedCatalogItemDto[];

  @ApiProperty({
    description: '액세서리 추천',
    type: () => PcRecommendedCatalogItemDto,
    isArray: true,
  })
  accessories: PcRecommendedCatalogItemDto[];
}

export class PcAnalyzeUploadResponseDto {
  @ApiProperty({ description: '게스트 세션 토큰', example: 'pc-session-token' })
  sessionToken: string;

  @ApiProperty({ description: '분석 ID', example: 1 })
  analysisId: number;

  @ApiProperty({ description: '분석 상태', example: 'ANALYZING' })
  status: string;
}

export class PcAnalysisDetailResponseDto {
  @ApiProperty({ description: '분석 ID', example: 1 })
  analysisId: number;

  @ApiProperty({ description: '분석 상태', example: 'COMPLETED' })
  status: string;

  @ApiPropertyOptional({
    description: '퍼스널 컬러 시즌 코드',
    enum: PcSeasonCode,
    nullable: true,
  })
  seasonCode: PcSeasonCode | null;

  @ApiPropertyOptional({
    description: '퍼스널 컬러 시즌명',
    example: '봄 웜톤',
    nullable: true,
  })
  seasonName: string | null;

  @ApiPropertyOptional({
    description: '분석 이유',
    example: '피부톤과 채도가 밝고 따뜻한 편입니다.',
    nullable: true,
  })
  reason: string | null;

  @ApiPropertyOptional({
    description: '최종 신뢰도',
    example: 82.5,
    nullable: true,
  })
  primaryConfidence: number | null;

  @ApiPropertyOptional({
    description: '시즌별 점수',
    type: Object,
    example: {
      SPRING_WARM: 82.5,
      SUMMER_COOL: 7.5,
      AUTUMN_WARM: 8,
      WINTER_COOL: 2,
    },
    nullable: true,
  })
  seasonScores: Record<string, number> | null;

  @ApiPropertyOptional({
    description: '추정 성별',
    enum: PcEstimatedGender,
    nullable: true,
  })
  estimatedGender: string | null;

  @ApiPropertyOptional({
    description: '추천 컬러 팔레트',
    type: () => PcPaletteDto,
    nullable: true,
  })
  palette: PcPaletteDto | null;

  @ApiPropertyOptional({
    description: '추천 카탈로그 목록',
    type: () => PcRecommendationsDto,
    nullable: true,
  })
  recommendations: PcRecommendationsDto | null;

  @ApiPropertyOptional({
    description: '재촬영 가이드',
    type: String,
    isArray: true,
    nullable: true,
    example: ['자연광 아래 정면 사진으로 다시 촬영해주세요.'],
  })
  retryGuide: string[] | null;
}

export class PcTryOnRequestDto {
  @IsNumber({
    propertyName: 'analysisId',
    min: 1,
    example: 1,
    description: '분석 ID',
  })
  analysisId: number;

  @IsNumber({
    propertyName: 'topItemId',
    min: 1,
    example: 1,
    description: '상의 카탈로그 아이템 ID',
  })
  topItemId: number;

  @IsNumber({
    propertyName: 'bottomItemId',
    min: 1,
    example: 2,
    description: '하의 카탈로그 아이템 ID',
  })
  bottomItemId: number;

  @IsNumber({
    propertyName: 'accessoryItemId',
    min: 1,
    example: 3,
    description: '액세서리 카탈로그 아이템 ID',
    optional: true,
  })
  accessoryItemId?: number;
}

export class PcTryOnResponseDto {
  @ApiProperty({ description: '룩 ID', example: 1 })
  lookId: number;

  @ApiProperty({ description: '가상 피팅 상태', example: 'TRYON_PROCESSING' })
  status: string;
}

export class PcSelectedLookItemDto {
  @ApiProperty({ description: '카탈로그 아이템 ID', example: 1 })
  itemId: number;

  @ApiProperty({ description: '카탈로그 아이템 이름', example: '코랄 블라우스' })
  name: string;

  @ApiProperty({
    description: '카탈로그 이미지 URL',
    example: '/service-file-mng/v1/every/file-manager/download/storage-name',
  })
  imageUrl: string;

  @ApiPropertyOptional({
    description: '대표 색상 HEX',
    example: '#FF7F50',
    nullable: true,
  })
  dominantColorHex: string | null;

  @ApiProperty({
    description: '스타일 태그',
    type: String,
    isArray: true,
    example: ['soft', 'romantic'],
  })
  styleTags: string[];
}

export class PcSelectedLookItemsDto {
  @ApiProperty({ type: () => PcSelectedLookItemDto })
  top: PcSelectedLookItemDto;

  @ApiProperty({ type: () => PcSelectedLookItemDto })
  bottom: PcSelectedLookItemDto;

  @ApiPropertyOptional({
    type: () => PcSelectedLookItemDto,
    nullable: true,
  })
  accessory: PcSelectedLookItemDto | null;
}

export class PcLookDetailResponseDto {
  @ApiProperty({ description: '룩 ID', example: 1 })
  lookId: number;

  @ApiProperty({ description: '가상 피팅 상태', example: 'TRYON_COMPLETED' })
  status: string;

  @ApiPropertyOptional({
    description: '가상 피팅 결과 이미지 URL',
    example: '/service-file-mng/v1/every/file-manager/download/storage-name',
    nullable: true,
  })
  tryOnImageUrl: string | null;

  @ApiProperty({ type: () => PcSelectedLookItemsDto })
  selectedItems: PcSelectedLookItemsDto;

  @ApiProperty({ description: '저장 여부', example: false })
  savedYn: boolean;
}

export class PcSaveLookRequestDto {
  @IsString({
    min: 0,
    max: 500,
    propertyName: 'description',
    example: '데일리 오피스 룩',
    description: '저장 메모',
    optional: true,
  })
  description?: string;
}

export class PcSaveLookResponseDto {
  @ApiProperty({ description: '룩 ID', example: 1 })
  lookId: number;

  @ApiProperty({ description: '저장 여부', example: true })
  savedYn: boolean;
}

export class PcShareLookResponseDto {
  @ApiProperty({ description: '룩 ID', example: 1 })
  lookId: number;

  @ApiProperty({ description: '공유 토큰', example: 'pc-share-token' })
  shareToken: string;

  @ApiProperty({
    description: '공유 URL',
    example: '/service-personal-color/v1/personal-color/default/share/pc-share-token',
  })
  shareUrl: string;
}

export class PcSharedLookResponseDto {
  @ApiProperty({ description: '룩 ID', example: 1 })
  lookId: number;

  @ApiPropertyOptional({
    description: '퍼스널 컬러 시즌 코드',
    enum: PcSeasonCode,
    nullable: true,
  })
  seasonCode: PcSeasonCode | null;

  @ApiPropertyOptional({
    description: '퍼스널 컬러 시즌명',
    example: '봄 웜톤',
    nullable: true,
  })
  seasonName: string | null;

  @ApiPropertyOptional({
    description: '가상 피팅 결과 이미지 URL',
    example: '/service-file-mng/v1/every/file-manager/download/storage-name',
    nullable: true,
  })
  tryOnImageUrl: string | null;

  @ApiProperty({ type: () => PcSelectedLookItemsDto })
  selectedItems: PcSelectedLookItemsDto;

  @ApiPropertyOptional({
    description: '추천 컬러 팔레트',
    type: () => PcPaletteDto,
    nullable: true,
  })
  palette: PcPaletteDto | null;
}

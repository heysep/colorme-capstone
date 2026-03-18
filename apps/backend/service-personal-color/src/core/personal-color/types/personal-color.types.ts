import { PcCatalogItemType } from '@capstone-project/glb-commons';

export const PERSONAL_COLOR_SESSION_HEADER = 'x-pc-session-token';

export enum PcSeasonCode {
  SPRING_WARM = 'SPRING_WARM',
  SUMMER_COOL = 'SUMMER_COOL',
  AUTUMN_WARM = 'AUTUMN_WARM',
  WINTER_COOL = 'WINTER_COOL',
}

export enum PcToneUndertone {
  WARM = 'WARM',
  NEUTRAL_WARM = 'NEUTRAL_WARM',
  NEUTRAL = 'NEUTRAL',
  NEUTRAL_COOL = 'NEUTRAL_COOL',
  COOL = 'COOL',
}

export enum PcToneValue {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  DEEP = 'DEEP',
}

export enum PcToneChroma {
  SOFT = 'SOFT',
  MUTED = 'MUTED',
  CLEAR = 'CLEAR',
  VIBRANT = 'VIBRANT',
}

export enum PcToneContrast {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum PcEstimatedGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

export interface PcPaletteColor {
  label: string;
  hex: string;
}

export interface PcPalette {
  colors: PcPaletteColor[];
}

export interface PcStructuredAnalysisResult {
  canAnalyze: boolean;
  rejectionReasons: string[];
  undertone: PcToneUndertone;
  value: PcToneValue;
  chroma: PcToneChroma;
  contrast: PcToneContrast;
  estimatedGender: PcEstimatedGender;
  reasoning: string;
  hairTone?: string | null;
  eyeTone?: string | null;
}

export type PcSeasonScoreMap = Record<PcSeasonCode, number>;

export interface PcSeasonScoringResult {
  seasonCode: PcSeasonCode;
  seasonScores: PcSeasonScoreMap;
  primaryConfidence: number;
}

export interface PcCatalogItemView {
  itemId: number;
  itemType: PcCatalogItemType;
  name: string;
  imageFileId: string;
  imageUrl: string;
  dominantColorHex: string | null;
  styleTags: string[];
  parsedAttributes: Record<string, unknown> | null;
  recommendedSeasons: string[];
  recommendedGenders: string[];
  sortNo: number;
}

export interface PcRecommendedCatalogItem {
  itemId: number;
  name: string;
  imageUrl: string;
  dominantColorHex: string | null;
  styleTags: string[];
  reason: string;
}

export interface GeminiGeneratedImageResult {
  providerJobId: string;
  mimeType: string;
  buffer: Buffer;
}

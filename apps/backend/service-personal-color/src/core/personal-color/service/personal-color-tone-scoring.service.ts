import { Injectable } from '@nestjs/common';
import {
  PcSeasonCode,
  PcSeasonScoreMap,
  PcSeasonScoringResult,
  PcStructuredAnalysisResult,
  PcToneChroma,
  PcToneContrast,
  PcToneUndertone,
  PcToneValue,
} from '../types/personal-color.types';

@Injectable()
export class PersonalColorToneScoringService {
  scoreSeason(
    analysis: PcStructuredAnalysisResult,
  ): PcSeasonScoringResult {
    const baseScores: PcSeasonScoreMap = {
      [PcSeasonCode.SPRING_WARM]: 0,
      [PcSeasonCode.SUMMER_COOL]: 0,
      [PcSeasonCode.AUTUMN_WARM]: 0,
      [PcSeasonCode.WINTER_COOL]: 0,
    };

    this.applyUndertoneWeight(baseScores, analysis.undertone);
    this.applyValueWeight(baseScores, analysis.value);
    this.applyChromaWeight(baseScores, analysis.chroma);
    this.applyContrastWeight(baseScores, analysis.contrast);

    const total = Object.values(baseScores).reduce((sum, value) => sum + value, 0);
    const normalizedScores = Object.fromEntries(
      Object.entries(baseScores).map(([key, value]) => [
        key,
        Number(((value / total) * 100).toFixed(1)),
      ]),
    ) as PcSeasonScoreMap;

    const sorted = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1]);
    const seasonCode = sorted[0][0] as PcSeasonCode;

    return {
      seasonCode,
      seasonScores: normalizedScores,
      primaryConfidence: normalizedScores[seasonCode],
    };
  }

  buildRetryGuide(rejectionReasons: string[] = []): string[] {
    const defaultGuides = [
      '자연광 아래에서 얼굴 전체가 선명하게 보이도록 촬영해주세요.',
      '정면을 바라보고 머리카락이 얼굴을 가리지 않게 해주세요.',
      '필터나 과한 보정 없이 원본 사진을 사용해주세요.',
    ];

    if (rejectionReasons.length === 0) {
      return defaultGuides;
    }

    const mapped = rejectionReasons.map((reason) => {
      if (reason.includes('조명') || reason.includes('어둡')) {
        return '조명이 충분한 장소에서 다시 촬영해주세요.';
      }
      if (reason.includes('정면') || reason.includes('얼굴')) {
        return '얼굴이 정면으로 잘 보이도록 다시 촬영해주세요.';
      }
      return `${reason} 이후 다시 시도해주세요.`;
    });

    return Array.from(new Set([...mapped, ...defaultGuides])).slice(0, 4);
  }

  private applyUndertoneWeight(
    scores: PcSeasonScoreMap,
    undertone: PcToneUndertone,
  ) {
    const weights: Record<PcToneUndertone, PcSeasonScoreMap> = {
      [PcToneUndertone.WARM]: {
        [PcSeasonCode.SPRING_WARM]: 35,
        [PcSeasonCode.SUMMER_COOL]: 10,
        [PcSeasonCode.AUTUMN_WARM]: 35,
        [PcSeasonCode.WINTER_COOL]: 10,
      },
      [PcToneUndertone.NEUTRAL_WARM]: {
        [PcSeasonCode.SPRING_WARM]: 30,
        [PcSeasonCode.SUMMER_COOL]: 15,
        [PcSeasonCode.AUTUMN_WARM]: 30,
        [PcSeasonCode.WINTER_COOL]: 15,
      },
      [PcToneUndertone.NEUTRAL]: {
        [PcSeasonCode.SPRING_WARM]: 25,
        [PcSeasonCode.SUMMER_COOL]: 25,
        [PcSeasonCode.AUTUMN_WARM]: 25,
        [PcSeasonCode.WINTER_COOL]: 25,
      },
      [PcToneUndertone.NEUTRAL_COOL]: {
        [PcSeasonCode.SPRING_WARM]: 15,
        [PcSeasonCode.SUMMER_COOL]: 30,
        [PcSeasonCode.AUTUMN_WARM]: 15,
        [PcSeasonCode.WINTER_COOL]: 30,
      },
      [PcToneUndertone.COOL]: {
        [PcSeasonCode.SPRING_WARM]: 10,
        [PcSeasonCode.SUMMER_COOL]: 35,
        [PcSeasonCode.AUTUMN_WARM]: 10,
        [PcSeasonCode.WINTER_COOL]: 35,
      },
    };

    this.applyWeight(scores, weights[undertone]);
  }

  private applyValueWeight(scores: PcSeasonScoreMap, value: PcToneValue) {
    const weights: Record<PcToneValue, PcSeasonScoreMap> = {
      [PcToneValue.LIGHT]: {
        [PcSeasonCode.SPRING_WARM]: 20,
        [PcSeasonCode.SUMMER_COOL]: 20,
        [PcSeasonCode.AUTUMN_WARM]: 5,
        [PcSeasonCode.WINTER_COOL]: 5,
      },
      [PcToneValue.MEDIUM]: {
        [PcSeasonCode.SPRING_WARM]: 15,
        [PcSeasonCode.SUMMER_COOL]: 15,
        [PcSeasonCode.AUTUMN_WARM]: 15,
        [PcSeasonCode.WINTER_COOL]: 15,
      },
      [PcToneValue.DEEP]: {
        [PcSeasonCode.SPRING_WARM]: 5,
        [PcSeasonCode.SUMMER_COOL]: 5,
        [PcSeasonCode.AUTUMN_WARM]: 20,
        [PcSeasonCode.WINTER_COOL]: 20,
      },
    };

    this.applyWeight(scores, weights[value]);
  }

  private applyChromaWeight(scores: PcSeasonScoreMap, chroma: PcToneChroma) {
    const weights: Record<PcToneChroma, PcSeasonScoreMap> = {
      [PcToneChroma.SOFT]: {
        [PcSeasonCode.SPRING_WARM]: 5,
        [PcSeasonCode.SUMMER_COOL]: 20,
        [PcSeasonCode.AUTUMN_WARM]: 20,
        [PcSeasonCode.WINTER_COOL]: 5,
      },
      [PcToneChroma.MUTED]: {
        [PcSeasonCode.SPRING_WARM]: 5,
        [PcSeasonCode.SUMMER_COOL]: 18,
        [PcSeasonCode.AUTUMN_WARM]: 22,
        [PcSeasonCode.WINTER_COOL]: 5,
      },
      [PcToneChroma.CLEAR]: {
        [PcSeasonCode.SPRING_WARM]: 20,
        [PcSeasonCode.SUMMER_COOL]: 5,
        [PcSeasonCode.AUTUMN_WARM]: 5,
        [PcSeasonCode.WINTER_COOL]: 20,
      },
      [PcToneChroma.VIBRANT]: {
        [PcSeasonCode.SPRING_WARM]: 18,
        [PcSeasonCode.SUMMER_COOL]: 3,
        [PcSeasonCode.AUTUMN_WARM]: 7,
        [PcSeasonCode.WINTER_COOL]: 22,
      },
    };

    this.applyWeight(scores, weights[chroma]);
  }

  private applyContrastWeight(
    scores: PcSeasonScoreMap,
    contrast: PcToneContrast,
  ) {
    const weights: Record<PcToneContrast, PcSeasonScoreMap> = {
      [PcToneContrast.LOW]: {
        [PcSeasonCode.SPRING_WARM]: 5,
        [PcSeasonCode.SUMMER_COOL]: 20,
        [PcSeasonCode.AUTUMN_WARM]: 15,
        [PcSeasonCode.WINTER_COOL]: 0,
      },
      [PcToneContrast.MEDIUM]: {
        [PcSeasonCode.SPRING_WARM]: 10,
        [PcSeasonCode.SUMMER_COOL]: 10,
        [PcSeasonCode.AUTUMN_WARM]: 10,
        [PcSeasonCode.WINTER_COOL]: 10,
      },
      [PcToneContrast.HIGH]: {
        [PcSeasonCode.SPRING_WARM]: 15,
        [PcSeasonCode.SUMMER_COOL]: 0,
        [PcSeasonCode.AUTUMN_WARM]: 5,
        [PcSeasonCode.WINTER_COOL]: 20,
      },
    };

    this.applyWeight(scores, weights[contrast]);
  }

  private applyWeight(
    scores: PcSeasonScoreMap,
    weights: PcSeasonScoreMap,
  ) {
    Object.entries(weights).forEach(([key, value]) => {
      scores[key as PcSeasonCode] += value;
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PcCatalogItemType } from '@capstone-project/glb-commons';
import {
  PcEstimatedGender,
  PcPalette,
  PcRecommendedCatalogItem,
  PcSeasonCode,
  PcSeasonScoreMap,
} from '../types/personal-color.types';
import { PersonalColorCatalogService } from './personal-color-catalog.service';

@Injectable()
export class PersonalColorStylingService {
  constructor(
    private readonly personalColorCatalogService: PersonalColorCatalogService,
  ) {}

  async buildRecommendations(options: {
    seasonCode: PcSeasonCode;
    estimatedGender: string | null;
    palette: PcPalette | null;
    seasonScores: PcSeasonScoreMap;
  }) {
    const catalogItems =
      await this.personalColorCatalogService.getActiveCatalogItems();
    const scoredItems = catalogItems.map((item) => {
      const seasonMatched = item.recommendedSeasons.includes(options.seasonCode);
      const genderMatched = this.matchGender(
        item.recommendedGenders,
        options.estimatedGender,
      );
      const paletteScore = this.scorePaletteMatch(
        item.dominantColorHex,
        options.palette,
      );
      const styleScore = this.scoreStyleTagMatch(item.styleTags, options.seasonCode);
      const score =
        (seasonMatched ? 50 : 10) +
        (genderMatched ? 20 : 5) +
        paletteScore +
        styleScore -
        item.sortNo * 0.01;

      const reasons = [
        seasonMatched ? `${this.getSeasonLabel(options.seasonCode)}과 잘 맞는 아이템` : '무난한 시즌 호환 아이템',
        genderMatched ? '선호 성별 조건과 잘 맞는 스타일' : '성별 조건과 무관하게 활용 가능한 아이템',
        paletteScore > 0 ? '추천 팔레트와 색상 조화가 좋음' : '다른 포인트 아이템과 조합하기 쉬움',
      ];

      return {
        ...item,
        score,
        reason: reasons.join(', '),
      };
    });

    const takeByType = (itemType: PcCatalogItemType) =>
      scoredItems
        .filter((item) => item.itemType === itemType)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => ({
          itemId: item.itemId,
          name: item.name,
          imageUrl: item.imageUrl,
          dominantColorHex: item.dominantColorHex,
          styleTags: item.styleTags,
          reason: item.reason,
        }) satisfies PcRecommendedCatalogItem);

    return {
      tops: takeByType(PcCatalogItemType.TOP),
      bottoms: takeByType(PcCatalogItemType.BOTTOM),
      accessories: takeByType(PcCatalogItemType.ACCESSORY),
    };
  }

  private matchGender(
    recommendedGenders: string[],
    estimatedGender: string | null,
  ): boolean {
    if (recommendedGenders.length === 0) {
      return true;
    }

    if (!estimatedGender || estimatedGender === PcEstimatedGender.UNKNOWN) {
      return recommendedGenders.includes('UNISEX');
    }

    return (
      recommendedGenders.includes(estimatedGender) ||
      recommendedGenders.includes('UNISEX')
    );
  }

  private scorePaletteMatch(
    dominantColorHex: string | null,
    palette: PcPalette | null,
  ) {
    if (!dominantColorHex || !palette?.colors?.length) {
      return 0;
    }

    const dominant = this.hexToRgb(dominantColorHex);
    if (!dominant) {
      return 0;
    }

    let minDistance = Number.MAX_SAFE_INTEGER;
    for (const color of palette.colors) {
      const paletteRgb = this.hexToRgb(color.hex);
      if (!paletteRgb) {
        continue;
      }

      const distance = Math.sqrt(
        Math.pow(dominant.r - paletteRgb.r, 2) +
          Math.pow(dominant.g - paletteRgb.g, 2) +
          Math.pow(dominant.b - paletteRgb.b, 2),
      );
      minDistance = Math.min(minDistance, distance);
    }

    if (!isFinite(minDistance)) {
      return 0;
    }

    if (minDistance <= 40) return 15;
    if (minDistance <= 80) return 10;
    if (minDistance <= 120) return 6;
    return 2;
  }

  private scoreStyleTagMatch(styleTags: string[], seasonCode: PcSeasonCode) {
    const seasonTagMap: Record<PcSeasonCode, string[]> = {
      [PcSeasonCode.SPRING_WARM]: ['fresh', 'clear', 'bright', 'light'],
      [PcSeasonCode.SUMMER_COOL]: ['soft', 'cool', 'airy', 'elegant'],
      [PcSeasonCode.AUTUMN_WARM]: ['earthy', 'muted', 'cozy', 'natural'],
      [PcSeasonCode.WINTER_COOL]: ['sharp', 'contrast', 'bold', 'modern'],
    };

    const targets = seasonTagMap[seasonCode];
    const matchedCount = styleTags.filter((tag) => targets.includes(tag)).length;

    return Math.min(15, matchedCount * 5);
  }

  private hexToRgb(hex: string) {
    const normalized = hex.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return null;
    }

    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }

  private getSeasonLabel(seasonCode: PcSeasonCode) {
    const seasonLabels: Record<PcSeasonCode, string> = {
      [PcSeasonCode.SPRING_WARM]: '봄 웜톤',
      [PcSeasonCode.SUMMER_COOL]: '여름 쿨톤',
      [PcSeasonCode.AUTUMN_WARM]: '가을 웜톤',
      [PcSeasonCode.WINTER_COOL]: '겨울 쿨톤',
    };

    return seasonLabels[seasonCode];
  }
}

'use client';

import { useMemo } from 'react';
import type { PcCatalogItem, PcRecommendations } from '../api/pc-api';
import { resolveFileUrl } from '../api/pc-api';
import { styleLabel, type StyleKey } from '../lib/analysis-storage';
import { RetryImage } from './RetryImage';

export type TryOnSelection = {
  top: PcCatalogItem | null;
  bottom: PcCatalogItem | null;
  accessory: PcCatalogItem | null;
};

type SlotKey = keyof TryOnSelection;

const SLOT_META: { key: SlotKey; label: string; emoji: string; required: boolean }[] = [
  { key: 'top', label: '상의', emoji: '👕', required: true },
  { key: 'bottom', label: '하의', emoji: '👖', required: true },
  { key: 'accessory', label: '액세서리', emoji: '🧣', required: false },
];

/** 백엔드 styleTags ↔ 프론트 선호 스타일 매핑 (formal은 elegant 계열로 취급) */
const STYLE_TAG_MAP: Record<StyleKey, string[]> = {
  casual: ['casual'],
  formal: ['elegant', 'formal'],
  street: ['street'],
  romantic: ['romantic'],
  modern: ['modern'],
  vintage: ['vintage'],
};

const matchesPreference = (item: PcCatalogItem, styles: StyleKey[]) =>
  styles.some((s) =>
    STYLE_TAG_MAP[s].some((tag) => item.styleTags.includes(tag)),
  );

type RecommendationSectionProps = {
  recommendations: PcRecommendations;
  preferredStyles: StyleKey[];
  selection: TryOnSelection;
  onSelect: (slot: SlotKey, item: PcCatalogItem) => void;
};

export function RecommendationSection({
  recommendations,
  preferredStyles,
  selection,
  onSelect,
}: RecommendationSectionProps) {
  const groups = useMemo(() => {
    const sortByPreference = (items: PcCatalogItem[]) =>
      preferredStyles.length === 0
        ? items
        : [...items].sort(
            (a, b) =>
              Number(matchesPreference(b, preferredStyles)) -
              Number(matchesPreference(a, preferredStyles)),
          );
    return {
      top: sortByPreference(recommendations.tops),
      bottom: sortByPreference(recommendations.bottoms),
      accessory: sortByPreference(recommendations.accessories),
    } satisfies Record<SlotKey, PcCatalogItem[]>;
  }, [recommendations, preferredStyles]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-gray-900 sm:text-2xl dark:text-gray-100">
          추천 스타일 코디
        </h2>
        {preferredStyles.length > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            선호도 반영됨:
            <span className="flex gap-1">
              {preferredStyles.map((s) => (
                <span key={s} className="rounded-full bg-primary/15 px-2 py-0.5">
                  {styleLabel(s)}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        퍼스널 컬러에 어울리는 의상이에요. 상의와 하의를 선택하면 가상 피팅을 시작할 수 있습니다.
      </p>

      {SLOT_META.map(({ key, label, emoji, required }) => (
        <div key={key} className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-black text-gray-800 dark:text-gray-200">
            <span aria-hidden>{emoji}</span>
            {label}
            {required ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary">
                필수 선택
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.65rem] font-bold text-gray-400 dark:bg-white/10 dark:text-gray-500">
                선택 사항
              </span>
            )}
          </h3>
          {groups[key].length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500">
              추천 가능한 {label} 아이템이 없습니다. 카탈로그 시드 데이터를 확인해 주세요.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {groups[key].map((item) => {
                const selected = selection[key]?.itemId === item.itemId;
                const preferred = matchesPreference(item, preferredStyles);
                return (
                  <li key={item.itemId}>
                    <button
                      type="button"
                      onClick={() => onSelect(key, item)}
                      data-selected={selected}
                      className="option-card w-full p-0! gap-0! overflow-hidden text-left"
                    >
                      {selected && (
                        <span className="option-check z-10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        </span>
                      )}
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
                        <RetryImage
                          src={resolveFileUrl(item.imageUrl) ?? ''}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        {preferred && preferredStyles.length > 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold text-white shadow">
                            선호 스타일
                          </span>
                        )}
                      </div>
                      <div className="w-full space-y-1.5 p-3">
                        <p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">
                          {item.name}
                        </p>
                        <p className="line-clamp-2 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                          {item.reason}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {item.dominantColorHex && (
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/10 dark:border-white/20"
                              style={{ backgroundColor: item.dominantColorHex }}
                            />
                          )}
                          {item.styleTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.6rem] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

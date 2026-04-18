/**
 * 결과 페이지 목업 데이터.
 * @TODO: API (2026/04/18) — 실제 AI 퍼스널 컬러 분석 결과로 교체
 */
import type { StyleKey } from '../lib/analysis-storage';

export type SeasonTone = 'spring-warm' | 'summer-cool' | 'autumn-warm' | 'winter-cool';

export type SeasonInfo = {
  tone: SeasonTone;
  label: string;
  description: string;
  gradient: string; // tailwind gradient classes
  palette: { name: string; hex: string }[];
};

export const SEASON_TABLE: Record<SeasonTone, SeasonInfo> = {
  'spring-warm': {
    tone: 'spring-warm',
    label: 'Spring Warm',
    description: '밝고 따뜻한 톤이 잘 어울리는 봄 웜톤입니다.',
    gradient: 'from-orange-400 via-pink-400 to-rose-500',
    palette: [
      { name: 'Coral Pink', hex: '#F38585' },
      { name: 'Peach', hex: '#FAD3B2' },
      { name: 'Warm Beige', hex: '#E4C9A2' },
      { name: 'Golden Yellow', hex: '#F1CB2A' },
      { name: 'Warm Green', hex: '#86B08A' },
      { name: 'Turquoise', hex: '#1FC0B4' },
    ],
  },
  'summer-cool': {
    tone: 'summer-cool',
    label: 'Summer Cool',
    description: '부드럽고 시원한 파스텔이 잘 어울리는 여름 쿨톤입니다.',
    gradient: 'from-sky-400 via-blue-400 to-indigo-500',
    palette: [
      { name: 'Lavender', hex: '#C9B8E1' },
      { name: 'Powder Blue', hex: '#B7D8E8' },
      { name: 'Rose Pink', hex: '#E9B1C3' },
      { name: 'Mint', hex: '#B9E3D2' },
      { name: 'Cool Gray', hex: '#B6BDC8' },
      { name: 'Soft Mauve', hex: '#C8A7C4' },
    ],
  },
  'autumn-warm': {
    tone: 'autumn-warm',
    label: 'Autumn Warm',
    description: '깊고 차분한 톤이 잘 어울리는 가을 웜톤입니다.',
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    palette: [
      { name: 'Rust', hex: '#B0552F' },
      { name: 'Camel', hex: '#C69A66' },
      { name: 'Olive', hex: '#8A8A3D' },
      { name: 'Terracotta', hex: '#CC6D50' },
      { name: 'Mustard', hex: '#C9A227' },
      { name: 'Deep Teal', hex: '#2F6F6F' },
    ],
  },
  'winter-cool': {
    tone: 'winter-cool',
    label: 'Winter Cool',
    description: '선명하고 대비가 강한 컬러가 잘 어울리는 겨울 쿨톤입니다.',
    gradient: 'from-slate-500 via-indigo-500 to-fuchsia-600',
    palette: [
      { name: 'Pure White', hex: '#F4F4F6' },
      { name: 'Ice Blue', hex: '#9AC7E6' },
      { name: 'Royal Blue', hex: '#234AA5' },
      { name: 'Fuchsia', hex: '#CE3A8F' },
      { name: 'Jet Black', hex: '#111114' },
      { name: 'Emerald', hex: '#0E7F5C' },
    ],
  },
};

/**
 * 임시: 이메일 길이 등으로 결정론적 결과 생성(데모용).
 */
export const pickSeason = (seed: string): SeasonInfo => {
  const tones: SeasonTone[] = [
    'spring-warm',
    'summer-cool',
    'autumn-warm',
    'winter-cool',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return SEASON_TABLE[tones[hash % tones.length]];
};

export type RecommendedItem = {
  id: string;
  brand: string;
  name: string;
  price: string;
  imageUrl: string;
  style: StyleKey;
};

export const RECOMMENDED_ITEMS: RecommendedItem[] = [
  {
    id: 'r1',
    brand: 'ZARA',
    name: '코랄 니트 가디건',
    price: '49,900원',
    imageUrl:
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80',
    style: 'casual',
  },
  {
    id: 'r2',
    brand: 'Uniqlo',
    name: '베이지 린넨 블라우스',
    price: '39,900원',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    style: 'modern',
  },
  {
    id: 'r3',
    brand: 'H&M',
    name: '피치 컬러 플레어 원피스',
    price: '59,900원',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    style: 'romantic',
  },
  {
    id: 'r4',
    brand: 'Mango',
    name: '골든 옐로우 스웨터',
    price: '69,900원',
    imageUrl:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    style: 'casual',
  },
];

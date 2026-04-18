import { Metadata } from 'next';
import { ResultView } from '@/features/analysis/result/ResultView';

export const metadata: Metadata = {
  title: '분석 결과 | ColorMe',
  description: '퍼스널 컬러 분석 결과와 추천 스타일 코디를 확인하세요.',
};

export default function ResultPage() {
  return <ResultView />;
}

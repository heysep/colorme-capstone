import { Metadata } from 'next';
import { SharedLookView } from '@/features/analysis/share/SharedLookView';

export const metadata: Metadata = {
  title: '공유된 가상 피팅 룩 | ColorMe',
  description: 'AI 퍼스널 컬러 분석과 가상 피팅으로 완성한 룩을 확인해 보세요.',
};

export default function SharedLookPage({
  params,
}: {
  params: { shareToken: string };
}) {
  return <SharedLookView shareToken={params.shareToken} />;
}

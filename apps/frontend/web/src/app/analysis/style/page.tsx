import { Metadata } from 'next';
import { StyleSelectView } from '@/features/analysis/style-select/StyleSelectView';

export const metadata: Metadata = {
  title: '스타일 선택 | ColorMe',
  description: '선호하는 스타일을 선택하면 더 정확한 코디 추천을 받을 수 있습니다.',
};

export default function StyleSelectPage() {
  return <StyleSelectView />;
}

import { Metadata } from 'next';
import { PreferenceView } from '@/features/analysis/preference/PreferenceView';

export const metadata: Metadata = {
  title: '선호도 반영 | ColorMe',
  description: '코디 추천에 스타일 선호도를 반영할지 선택합니다.',
};

export default function PreferencePage() {
  return <PreferenceView />;
}

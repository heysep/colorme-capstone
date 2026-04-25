import { Metadata } from 'next';
import { SettingsView } from '@/features/settings/components/SettingsView';

export const metadata: Metadata = {
  title: '설정 | ColorMe',
  description: 'ColorMe 환경 설정. 테마(라이트/다크/시스템)를 변경할 수 있습니다.',
};

export default function SettingsPage() {
  return <SettingsView />;
}

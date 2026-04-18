import { Metadata } from 'next';
import { UploadView } from '@/features/analysis/upload/UploadView';

export const metadata: Metadata = {
  title: '사진 업로드 | ColorMe',
  description: '사진을 업로드하거나 촬영하여 퍼스널 컬러 분석을 시작하세요.',
};

export default function UploadPage() {
  return <UploadView />;
}

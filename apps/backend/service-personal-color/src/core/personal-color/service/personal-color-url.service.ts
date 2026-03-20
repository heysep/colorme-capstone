import { Injectable } from '@nestjs/common';

@Injectable()
export class PersonalColorUrlService {
  buildFileDownloadUrl(storageName: string): string {
    const sanitized = storageName.replace(/[^a-zA-Z0-9._-]/g, '');
    const baseUrl = process.env.SERVICE_FILE_MNG_PUBLIC_BASE_URL;
    const prefix = process.env.SERVICE_FILE_MNG_PREFIX ?? 'service-file-mng';
    const version = process.env.SERVICE_FILE_MNG_VERSION ?? '1';
    const path = `/${prefix}/v${version}/every/file-manager/download/${sanitized}`;

    return baseUrl ? `${baseUrl.replace(/\/$/, '')}${path}` : path;
  }

  buildShareUrl(shareToken: string): string {
    const baseUrl = process.env.SERVICE_PERSONAL_COLOR_PUBLIC_BASE_URL;
    const prefix =
      process.env.SERVICE_PERSONAL_COLOR_PREFIX ?? 'service-personal-color';
    const version = process.env.SERVICE_PERSONAL_COLOR_VERSION ?? '1';
    const path = `/${prefix}/v${version}/personal-color/default/share/${shareToken}`;

    return baseUrl ? `${baseUrl.replace(/\/$/, '')}${path}` : path;
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersonalColorUrlService } from './personal-color-url.service';

@Injectable()
export class PersonalColorShareService {
  constructor(
    private readonly personalColorUrlService: PersonalColorUrlService,
  ) {}

  createShareToken() {
    return `pcs-${randomUUID()}`;
  }

  buildShareUrl(shareToken: string) {
    return this.personalColorUrlService.buildShareUrl(shareToken);
  }
}

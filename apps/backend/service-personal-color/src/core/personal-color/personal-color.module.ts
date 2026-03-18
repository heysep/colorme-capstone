import {
  GlbLogMxModule,
  TYPE_ORM_FOR_FEATURE,
  TYPE_ORM_FOR_FEATURE_SUBMYSQL,
} from '@capstone-project/glb-commons';
import { Module } from '@nestjs/common';
import { PersonalColorDefaultController } from './controller/personal-color-default.controller';
import { GeminiApiClientService } from './service/gemini-api-client.service';
import { GeminiPersonalColorProviderService } from './service/gemini-personal-color-provider.service';
import { GeminiTryOnProviderService } from './service/gemini-try-on-provider.service';
import { PersonalColorAnalysisService } from './service/personal-color-analysis.service';
import { PersonalColorCatalogService } from './service/personal-color-catalog.service';
import { PersonalColorGuestSessionService } from './service/personal-color-guest-session.service';
import { PersonalColorLookService } from './service/personal-color-look.service';
import { PersonalColorShareService } from './service/personal-color-share.service';
import { PersonalColorStylingService } from './service/personal-color-styling.service';
import { PersonalColorToneScoringService } from './service/personal-color-tone-scoring.service';
import { PersonalColorUrlService } from './service/personal-color-url.service';

@Module({
  imports: [
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-PERSONAL-COLOR-CORE',
      useInterceptor: false,
    }),
    TYPE_ORM_FOR_FEATURE,
    TYPE_ORM_FOR_FEATURE_SUBMYSQL,
  ],
  controllers: [PersonalColorDefaultController],
  providers: [
    GeminiApiClientService,
    GeminiPersonalColorProviderService,
    GeminiTryOnProviderService,
    PersonalColorGuestSessionService,
    PersonalColorCatalogService,
    PersonalColorToneScoringService,
    PersonalColorStylingService,
    PersonalColorAnalysisService,
    PersonalColorShareService,
    PersonalColorLookService,
    PersonalColorUrlService,
  ],
})
export class PersonalColorModule {}

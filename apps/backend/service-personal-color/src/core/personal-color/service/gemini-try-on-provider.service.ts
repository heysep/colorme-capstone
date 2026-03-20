import { CommonError, LogMxProvider } from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersonalColorError } from '../error/personal-color.error';
import { GeminiGeneratedImageResult, PcPalette } from '../types/personal-color.types';
import { GeminiApiClientService } from './gemini-api-client.service';

@Injectable()
export class GeminiTryOnProviderService {
  constructor(
    private readonly geminiApiClientService: GeminiApiClientService,
    private readonly logMxProvider: LogMxProvider,
  ) {}

  async generateTryOn(options: {
    personImage: {
      buffer: Buffer;
      mimeType: string;
    };
    topImage: {
      buffer: Buffer;
      mimeType: string;
      name: string;
    };
    bottomImage: {
      buffer: Buffer;
      mimeType: string;
      name: string;
    };
    accessoryImage?: {
      buffer: Buffer;
      mimeType: string;
      name: string;
    } | null;
    seasonName: string;
    analysisReason: string | null;
    palette: PcPalette | null;
  }): Promise<GeminiGeneratedImageResult> {
    const model =
      process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3.1-flash-image-preview';

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.attemptGenerateTryOn(model, options);
      } catch (e) {
        lastError = e;
        this.logMxProvider.errorNoMetadata(
          `Gemini try-on attempt ${attempt + 1} failed: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
    throw lastError;
  }

  private async attemptGenerateTryOn(
    model: string,
    options: {
      personImage: { buffer: Buffer; mimeType: string };
      topImage: { buffer: Buffer; mimeType: string; name: string };
      bottomImage: { buffer: Buffer; mimeType: string; name: string };
      accessoryImage?: { buffer: Buffer; mimeType: string; name: string } | null;
      seasonName: string;
      analysisReason: string | null;
      palette: PcPalette | null;
    },
  ): Promise<GeminiGeneratedImageResult> {
    const promptParts = [
      'The first image is the person to preserve.',
      `Use the second image as the reference top garment: ${options.topImage.name}.`,
      `Use the third image as the reference bottom garment: ${options.bottomImage.name}.`,
      options.accessoryImage
        ? `Use the fourth image as the accessory reference: ${options.accessoryImage.name}.`
        : 'No accessory image is provided.',
      `The target personal color season is ${options.seasonName}.`,
      options.analysisReason
        ? `Personal color analysis note: ${options.analysisReason}.`
        : '',
      options.palette?.colors?.length
        ? `Keep the styling harmonized with this palette: ${options.palette.colors
            .map((color) => `${color.label} ${color.hex}`)
            .join(', ')}.`
        : '',
      'Create a realistic upper-body fashion try-on image.',
      'Preserve the person face, hair, skin tone, body shape, and pose.',
      'Replace clothing only, keep lighting natural, avoid changing the background drastically.',
      'Make the garments look wearable and clean, without text overlays.',
    ]
      .filter(Boolean)
      .join(' ');

    const response = await this.geminiApiClientService.generateContent(model, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptParts,
            },
            {
              inline_data: {
                mime_type: options.personImage.mimeType,
                data: options.personImage.buffer.toString('base64'),
              },
            },
            {
              inline_data: {
                mime_type: options.topImage.mimeType,
                data: options.topImage.buffer.toString('base64'),
              },
            },
            {
              inline_data: {
                mime_type: options.bottomImage.mimeType,
                data: options.bottomImage.buffer.toString('base64'),
              },
            },
            ...(options.accessoryImage
              ? [
                  {
                    inline_data: {
                      mime_type: options.accessoryImage.mimeType,
                      data: options.accessoryImage.buffer.toString('base64'),
                    },
                  },
                ]
              : []),
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imagePart = this.extractImagePart(response);
    if (!imagePart) {
      this.logMxProvider.errorNoMetadata(
        `Gemini try-on did not return an image: ${JSON.stringify(response)}`,
      );
      throw CommonError.createByErrorCode(PersonalColorError.GEMINI_TRYON_ERROR);
    }

    return {
      providerJobId: `gemini-${randomUUID()}`,
      mimeType: imagePart.mimeType,
      buffer: Buffer.from(imagePart.data, 'base64'),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractImagePart(response: any):
    | {
        mimeType: string;
        data: string;
      }
    | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = response?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inlineData = part?.inlineData ?? part?.inline_data;
      if (inlineData?.data) {
        return {
          mimeType: inlineData.mimeType ?? inlineData.mime_type ?? 'image/png',
          data: inlineData.data,
        };
      }
    }

    return null;
  }
}

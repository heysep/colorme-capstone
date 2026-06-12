import { CommonError, LogMxProvider } from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import OpenAI, { toFile } from 'openai';
import { PersonalColorError } from '../error/personal-color.error';
import { GeminiGeneratedImageResult, PcPalette } from '../types/personal-color.types';

/**
 * OpenAI gpt-image 모델 기반 가상 피팅 이미지 생성 프로바이더.
 * Gemini 이미지 생성이 무료 티어에서 막힌 환경의 대체 경로로 사용한다.
 * (PC_TRYON_PROVIDER=OPENAI 로 선택)
 */
@Injectable()
export class OpenAiTryOnProviderService {
  constructor(private readonly logMxProvider: LogMxProvider) {}

  async generateTryOn(options: {
    personImage: { buffer: Buffer; mimeType: string };
    topImage: { buffer: Buffer; mimeType: string; name: string };
    bottomImage: { buffer: Buffer; mimeType: string; name: string };
    accessoryImage?: { buffer: Buffer; mimeType: string; name: string } | null;
    seasonName: string;
    analysisReason: string | null;
    palette: PcPalette | null;
  }): Promise<GeminiGeneratedImageResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw CommonError.createByErrorCode(
        PersonalColorError.GEMINI_TRYON_ERROR,
        'OPENAI_API_KEY 환경 변수가 필요합니다.',
      );
    }

    const model = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1';
    const client = new OpenAI({ apiKey });

    const prompt = [
      'The first image is the person to preserve.',
      `The second image is the reference top garment: ${options.topImage.name}.`,
      `The third image is the reference bottom garment: ${options.bottomImage.name}.`,
      options.accessoryImage
        ? `The fourth image is the accessory reference: ${options.accessoryImage.name}.`
        : '',
      `The target personal color season is ${options.seasonName}.`,
      options.palette?.colors?.length
        ? `Keep the styling harmonized with this palette: ${options.palette.colors
            .map((color) => `${color.label} ${color.hex}`)
            .join(', ')}.`
        : '',
      'Create a realistic fashion try-on image.',
      'Preserve the person face, hair, skin tone, body shape, and pose.',
      'Replace clothing only, keep lighting natural, keep the background similar.',
      'Make the garments look wearable and clean, without any text overlays.',
    ]
      .filter(Boolean)
      .join(' ');

    const extOf = (mime: string) => (mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png');

    const images = [
      await toFile(options.personImage.buffer, `person.${extOf(options.personImage.mimeType)}`, {
        type: options.personImage.mimeType,
      }),
      await toFile(options.topImage.buffer, `top.${extOf(options.topImage.mimeType)}`, {
        type: options.topImage.mimeType,
      }),
      await toFile(options.bottomImage.buffer, `bottom.${extOf(options.bottomImage.mimeType)}`, {
        type: options.bottomImage.mimeType,
      }),
      ...(options.accessoryImage
        ? [
            await toFile(
              options.accessoryImage.buffer,
              `accessory.${extOf(options.accessoryImage.mimeType)}`,
              { type: options.accessoryImage.mimeType },
            ),
          ]
        : []),
    ];

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await client.images.edit({
          model,
          image: images,
          prompt,
          size: '1024x1536',
        });

        const b64 = response.data?.[0]?.b64_json;
        if (!b64) {
          throw CommonError.createByErrorCode(
            PersonalColorError.GEMINI_TRYON_ERROR,
            'OpenAI 이미지 응답이 비어 있습니다.',
          );
        }

        return {
          providerJobId: `openai-${randomUUID()}`,
          mimeType: 'image/png',
          buffer: Buffer.from(b64, 'base64'),
        };
      } catch (error) {
        lastError = error;
        this.logMxProvider.errorNoMetadata(
          `OpenAI try-on attempt ${attempt + 1} failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (lastError instanceof CommonError) {
      throw lastError;
    }
    throw CommonError.createByErrorCode(
      PersonalColorError.GEMINI_TRYON_ERROR,
      lastError instanceof Error ? lastError.message : undefined,
    );
  }
}

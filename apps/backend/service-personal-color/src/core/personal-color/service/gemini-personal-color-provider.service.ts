import { CommonError, LogMxProvider } from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { PersonalColorError } from '../error/personal-color.error';
import {
  PcEstimatedGender,
  PcStructuredAnalysisResult,
  PcToneChroma,
  PcToneContrast,
  PcToneUndertone,
  PcToneValue,
} from '../types/personal-color.types';
import { GeminiApiClientService } from './gemini-api-client.service';

@Injectable()
export class GeminiPersonalColorProviderService {
  constructor(
    private readonly geminiApiClientService: GeminiApiClientService,
    private readonly logMxProvider: LogMxProvider,
  ) {}

  async analyzeFace(options: {
    mimeType: string;
    buffer: Buffer;
  }): Promise<PcStructuredAnalysisResult> {
    const model = process.env.GEMINI_ANALYSIS_MODEL ?? 'gemini-2.5-flash';
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await this.geminiApiClientService.generateContent(model, {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: [
                    'You are a professional personal color consultant.',
                    'Analyze only the uploaded human face image.',
                    'Return JSON only with these keys:',
                    'canAnalyze, rejectionReasons, undertone, value, chroma, contrast, estimatedGender, reasoning, hairTone, eyeTone.',
                    'Use these enums exactly:',
                    'undertone: WARM | NEUTRAL_WARM | NEUTRAL | NEUTRAL_COOL | COOL',
                    'value: LIGHT | MEDIUM | DEEP',
                    'chroma: SOFT | MUTED | CLEAR | VIBRANT',
                    'contrast: LOW | MEDIUM | HIGH',
                    'estimatedGender: MALE | FEMALE | UNKNOWN',
                    'If the image is too dark, not frontal, not a face, or too low quality, set canAnalyze to false and explain why in rejectionReasons.',
                    'Write reasoning in Korean.',
                  ].join(' '),
                },
                {
                  inline_data: {
                    mime_type: options.mimeType,
                    data: options.buffer.toString('base64'),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const responseText = this.extractText(response);
        return this.normalizeAnalysisResult(responseText);
      } catch (error) {
        lastError = error;
        this.logMxProvider.errorNoMetadata(
          `Gemini personal color analyze retry ${attempt + 1} failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (lastError instanceof CommonError) {
      throw lastError;
    }

    throw CommonError.createByErrorCode(
      PersonalColorError.GEMINI_ANALYSIS_INVALID_RESPONSE,
      lastError instanceof Error ? lastError.message : undefined,
    );
  }

  private extractText(response: any): string {
    const parts: any[] = response?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((part) => part?.text)
      .find((value) => typeof value === 'string');

    if (!text) {
      throw CommonError.createByErrorCode(
        PersonalColorError.GEMINI_ANALYSIS_INVALID_RESPONSE,
      );
    }

    return text;
  }

  private normalizeAnalysisResult(
    rawText: string,
  ): PcStructuredAnalysisResult {
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      throw CommonError.createByErrorCode(
        PersonalColorError.GEMINI_ANALYSIS_INVALID_RESPONSE,
        error instanceof Error ? error.message : undefined,
      );
    }

    const normalized: PcStructuredAnalysisResult = {
      canAnalyze: Boolean(parsed.canAnalyze),
      rejectionReasons: Array.isArray(parsed.rejectionReasons)
        ? parsed.rejectionReasons.map(String)
        : [],
      undertone: this.ensureEnumValue(
        parsed.undertone,
        Object.values(PcToneUndertone),
        PcToneUndertone.NEUTRAL,
      ),
      value: this.ensureEnumValue(
        parsed.value,
        Object.values(PcToneValue),
        PcToneValue.MEDIUM,
      ),
      chroma: this.ensureEnumValue(
        parsed.chroma,
        Object.values(PcToneChroma),
        PcToneChroma.SOFT,
      ),
      contrast: this.ensureEnumValue(
        parsed.contrast,
        Object.values(PcToneContrast),
        PcToneContrast.MEDIUM,
      ),
      estimatedGender: this.ensureEnumValue(
        parsed.estimatedGender,
        Object.values(PcEstimatedGender),
        PcEstimatedGender.UNKNOWN,
      ),
      reasoning:
        typeof parsed.reasoning === 'string' && parsed.reasoning.length > 0
          ? parsed.reasoning
          : '분석 근거를 충분히 생성하지 못했습니다.',
      hairTone:
        typeof parsed.hairTone === 'string' ? parsed.hairTone : (null as string | null),
      eyeTone:
        typeof parsed.eyeTone === 'string' ? parsed.eyeTone : (null as string | null),
    };

    return normalized;
  }

  private ensureEnumValue<T extends string>(
    value: unknown,
    allowedValues: T[],
    fallback: T,
  ): T {
    return allowedValues.includes(value as T) ? (value as T) : fallback;
  }
}

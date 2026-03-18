import { CommonError, LogMxProvider } from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { PersonalColorError } from '../error/personal-color.error';

@Injectable()
export class GeminiApiClientService {
  constructor(private readonly logMxProvider: LogMxProvider) {}

  async generateContent(model: string, body: Record<string, unknown>) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw CommonError.createByErrorCode(
        PersonalColorError.GEMINI_ANALYSIS_ERROR,
        'GEMINI_API_KEY 환경 변수가 필요합니다.',
      );
    }

    const normalizedModel = model.startsWith('models/')
      ? model.replace(/^models\//, '')
      : model;
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? 30000);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logMxProvider.errorNoMetadata(
        `Gemini API error [${response.status}]: ${text}`,
      );
      throw CommonError.createByErrorCode(
        PersonalColorError.GEMINI_ANALYSIS_ERROR,
        `Gemini API 호출 실패: ${response.status}`,
      );
    }

    return response.json();
  }
}

/**
 * 업로드된 사진이 퍼스널 컬러 진단에 적합한지 사전 검증.
 * canvas에서 축소 샘플링 후 루미넌스·컬러 캐스트·클리핑·해상도를 측정한다.
 *
 * 참고 — Vision 모델(Gemini/GPT) 호출 전 단계이므로 네트워크 비용 없이
 * "조명이 너무 어둡습니다" 등 즉시 피드백을 제공한다.
 */

export type QualityIssueCode =
  | 'too-dark'
  | 'too-bright'
  | 'low-contrast'
  | 'warm-cast'
  | 'cool-cast'
  | 'clipped-shadows'
  | 'clipped-highlights'
  | 'low-resolution';

export type QualityIssue = {
  severity: 'error' | 'warning';
  code: QualityIssueCode;
  title: string;
  description: string;
};

export type QualityMetrics = {
  width: number;
  height: number;
  avgLuminance: number;
  stddevLuminance: number;
  meanR: number;
  meanG: number;
  meanB: number;
  clippedDarkRatio: number;
  clippedBrightRatio: number;
};

export type QualityReport = {
  issues: QualityIssue[];
  hasError: boolean;
  metrics: QualityMetrics;
};

const SAMPLE_SIZE = 256;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
    img.src = src;
  });

const computeMetrics = (
  img: HTMLImageElement
): QualityMetrics | null => {
  const canvas = document.createElement('canvas');
  const ratio = Math.min(
    SAMPLE_SIZE / img.naturalWidth,
    SAMPLE_SIZE / img.naturalHeight,
    1
  );
  canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let sumL = 0;
  let sumLSq = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let clippedDark = 0;
  let clippedBright = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Rec. 601 luminance
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    sumL += y;
    sumLSq += y * y;
    sumR += r;
    sumG += g;
    sumB += b;
    if (y <= 15) clippedDark++;
    if (y >= 240) clippedBright++;
  }

  const avgL = sumL / pixelCount;
  const varL = sumLSq / pixelCount - avgL * avgL;
  const stddevL = Math.sqrt(Math.max(0, varL));

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    avgLuminance: avgL,
    stddevLuminance: stddevL,
    meanR: sumR / pixelCount,
    meanG: sumG / pixelCount,
    meanB: sumB / pixelCount,
    clippedDarkRatio: clippedDark / pixelCount,
    clippedBrightRatio: clippedBright / pixelCount,
  };
};

const deriveIssues = (m: QualityMetrics): QualityIssue[] => {
  const issues: QualityIssue[] = [];

  if (m.avgLuminance < 60) {
    issues.push({
      severity: 'error',
      code: 'too-dark',
      title: '조명이 너무 어둡습니다',
      description:
        '밝은 자연광 또는 조명이 있는 환경에서 다시 촬영해 주세요. 얼굴에 그림자가 많으면 퍼스널 컬러가 부정확하게 판별될 수 있습니다.',
    });
  } else if (m.avgLuminance > 220) {
    issues.push({
      severity: 'error',
      code: 'too-bright',
      title: '사진이 과노출 되었습니다',
      description:
        '직사광선 또는 강한 플래시를 피하고, 균일한 간접광 아래에서 촬영해 주세요.',
    });
  }

  if (m.stddevLuminance < 28 && m.avgLuminance >= 60 && m.avgLuminance <= 220) {
    issues.push({
      severity: 'warning',
      code: 'low-contrast',
      title: '대비가 낮습니다',
      description:
        '피부 톤의 차이가 잘 드러나지 않을 수 있습니다. 더 선명하게 찍힌 사진을 사용하면 정확도가 올라갑니다.',
    });
  }

  // 컬러 캐스트 — 노란/주황(웜) 또는 푸른(쿨) 조명 편향
  const meanGray = (m.meanR + m.meanG + m.meanB) / 3;
  if (meanGray > 0) {
    const rBias = m.meanR / meanGray;
    const bBias = m.meanB / meanGray;
    if (rBias > 1.18 && bBias < 0.88) {
      issues.push({
        severity: 'warning',
        code: 'warm-cast',
        title: '조명이 너무 붉거나 따뜻합니다',
        description:
          '노란빛 실내등 아래에서 찍으면 웜톤으로 치우쳐 보일 수 있습니다. 가능하면 주광(자연광)에서 다시 찍어주세요.',
      });
    } else if (bBias > 1.15 && rBias < 0.92) {
      issues.push({
        severity: 'warning',
        code: 'cool-cast',
        title: '조명이 너무 푸릅니다',
        description:
          '형광등·모니터빛 등에서는 쿨톤으로 치우칠 수 있습니다. 중립적인 백색 조명에서 다시 촬영해 주세요.',
      });
    }
  }

  if (m.clippedDarkRatio > 0.35) {
    issues.push({
      severity: 'warning',
      code: 'clipped-shadows',
      title: '어두운 영역이 뭉개졌습니다',
      description:
        '사진의 어두운 부분 색 정보가 손실되었습니다. 피부 영역이 어둡다면 조명을 추가해 주세요.',
    });
  }
  if (m.clippedBrightRatio > 0.25) {
    issues.push({
      severity: 'warning',
      code: 'clipped-highlights',
      title: '밝은 영역이 하얗게 날아갔습니다',
      description:
        '직접광·플래시로 인해 피부의 색 정보가 사라졌을 수 있습니다. 더 부드러운 광원으로 다시 촬영해 주세요.',
    });
  }

  if (m.width < 400 || m.height < 400) {
    issues.push({
      severity: 'warning',
      code: 'low-resolution',
      title: '해상도가 낮습니다',
      description:
        '사진의 해상도가 낮아 피부 색상 판별이 어렵습니다. 가능하면 더 큰 사진을 사용해 주세요.',
    });
  }

  return issues;
};

export const analyzeImage = async (dataUrl: string): Promise<QualityReport> => {
  const img = await loadImage(dataUrl);
  const metrics = computeMetrics(img);
  if (!metrics) {
    return {
      issues: [
        {
          severity: 'error',
          code: 'too-dark',
          title: '사진을 분석할 수 없습니다',
          description: '다른 사진으로 다시 시도해 주세요.',
        },
      ],
      hasError: true,
      metrics: {
        width: img.naturalWidth,
        height: img.naturalHeight,
        avgLuminance: 0,
        stddevLuminance: 0,
        meanR: 0,
        meanG: 0,
        meanB: 0,
        clippedDarkRatio: 0,
        clippedBrightRatio: 0,
      },
    };
  }
  const issues = deriveIssues(metrics);
  return {
    issues,
    hasError: issues.some((i) => i.severity === 'error'),
    metrics,
  };
};

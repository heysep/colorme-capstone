/**
 * 퍼스널 컬러 데모용 시드 스크립트.
 * - rn_default_personal_color: 시즌 마스터 4종 + 추천 팔레트
 * - rn_default_pc_catalog_item: 의상 카탈로그 (상의/하의/액세서리)
 * - rn_default_upload_file + MinIO: 카탈로그 이미지 (sharp로 생성한 의상 일러스트)
 *
 * 실행: pnpm seed:personal-color  (루트 .env 사용, 멱등 — 재실행 시 기존 시드 갱신)
 */
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
const Minio = require('minio');
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const loadEnv = () => {
  const envPath = path.join(ROOT, '.env');
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="?([^"]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
};
loadEnv();

const BUCKET = 'sihun-bucket';

const SEASONS = [
  {
    seasonCode: 'SPRING_WARM',
    seasonName: '봄 웜톤',
    description: '밝고 따뜻한 톤이 잘 어울리는 봄 웜톤입니다.',
    palette: {
      colors: [
        { label: 'Coral Pink', hex: '#F38585' },
        { label: 'Peach', hex: '#FAD3B2' },
        { label: 'Warm Beige', hex: '#E4C9A2' },
        { label: 'Golden Yellow', hex: '#F1CB2A' },
        { label: 'Warm Green', hex: '#86B08A' },
        { label: 'Turquoise', hex: '#1FC0B4' },
      ],
    },
  },
  {
    seasonCode: 'SUMMER_COOL',
    seasonName: '여름 쿨톤',
    description: '부드럽고 시원한 파스텔이 잘 어울리는 여름 쿨톤입니다.',
    palette: {
      colors: [
        { label: 'Lavender', hex: '#C9B8E1' },
        { label: 'Powder Blue', hex: '#B7D8E8' },
        { label: 'Rose Pink', hex: '#E9B1C3' },
        { label: 'Mint', hex: '#B9E3D2' },
        { label: 'Cool Gray', hex: '#B6BDC8' },
        { label: 'Soft Mauve', hex: '#C8A7C4' },
      ],
    },
  },
  {
    seasonCode: 'AUTUMN_WARM',
    seasonName: '가을 웜톤',
    description: '깊고 차분한 톤이 잘 어울리는 가을 웜톤입니다.',
    palette: {
      colors: [
        { label: 'Rust', hex: '#B0552F' },
        { label: 'Camel', hex: '#C69A66' },
        { label: 'Olive', hex: '#8A8A3D' },
        { label: 'Terracotta', hex: '#CC6D50' },
        { label: 'Mustard', hex: '#C9A227' },
        { label: 'Deep Teal', hex: '#2F6F6F' },
      ],
    },
  },
  {
    seasonCode: 'WINTER_COOL',
    seasonName: '겨울 쿨톤',
    description: '선명하고 대비가 강한 컬러가 잘 어울리는 겨울 쿨톤입니다.',
    palette: {
      colors: [
        { label: 'Pure White', hex: '#F4F4F6' },
        { label: 'Ice Blue', hex: '#9AC7E6' },
        { label: 'Royal Blue', hex: '#234AA5' },
        { label: 'Fuchsia', hex: '#CE3A8F' },
        { label: 'Jet Black', hex: '#111114' },
        { label: 'Emerald', hex: '#0E7F5C' },
      ],
    },
  },
];

// 의상 SVG 일러스트 (itemType별 실루엣 + 대표 색상)
const garmentSvg = (itemType, hex, accent) => {
  const shapes = {
    TOP: `
      <path d="M170 120 L240 90 Q256 110 272 90 L342 120 L322 190 L300 180 L300 400 Q256 420 212 400 L212 180 L190 190 Z"
        fill="${hex}" stroke="${accent}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M240 90 Q256 110 272 90" fill="none" stroke="${accent}" stroke-width="6"/>`,
    BOTTOM: `
      <path d="M200 90 L312 90 L322 200 L330 420 L272 420 L258 230 L254 230 L240 420 L182 420 L190 200 Z"
        fill="${hex}" stroke="${accent}" stroke-width="6" stroke-linejoin="round"/>
      <line x1="200" y1="120" x2="312" y2="120" stroke="${accent}" stroke-width="6"/>`,
    ACCESSORY: `
      <circle cx="256" cy="230" r="110" fill="none" stroke="${hex}" stroke-width="44"/>
      <circle cx="256" cy="230" r="110" fill="none" stroke="${accent}" stroke-width="6" stroke-dasharray="18 14"/>
      <path d="M256 340 L236 430 L276 430 Z" fill="${hex}" stroke="${accent}" stroke-width="6"/>`,
  };
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" rx="48" fill="#FAFAF8"/>
    ${shapes[itemType]}
  </svg>`);
};

// 실사 의류 사진(Unsplash, 무료 라이선스) — 다운로드 실패 시 SVG 일러스트 폴백
const CATALOG = [
  // ---- 상의 ----
  { itemType: 'TOP', name: 'NIKE 코랄 오버핏 티셔츠', hex: '#F38585', seasons: ['SPRING_WARM'], genders: ['UNISEX'], tags: ['fresh', 'bright', 'casual'], photo: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'TOP', name: 'UNIQLO 화이트 베이직 티셔츠', hex: '#E8EAF0', seasons: ['SUMMER_COOL', 'WINTER_COOL'], genders: ['UNISEX'], tags: ['soft', 'cool', 'elegant'], photo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'TOP', name: 'ZARA 머스타드 니트 스웨터', hex: '#C9A227', seasons: ['AUTUMN_WARM'], genders: ['UNISEX'], tags: ['earthy', 'cozy', 'natural'], photo: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'TOP', name: 'ADIDAS 로열 블루 트랙 자켓', hex: '#234AA5', seasons: ['WINTER_COOL'], genders: ['UNISEX'], tags: ['sharp', 'bold', 'modern', 'street'], photo: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80' },
  // ---- 하의 ----
  { itemType: 'BOTTOM', name: "LEVI'S 라이트 베이지 치노 팬츠", hex: '#E4C9A2', seasons: ['SPRING_WARM', 'AUTUMN_WARM'], genders: ['UNISEX'], tags: ['light', 'natural', 'casual'], photo: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'BOTTOM', name: 'ZARA 쿨 그레이 슬랙스', hex: '#B6BDC8', seasons: ['SUMMER_COOL', 'WINTER_COOL'], genders: ['UNISEX'], tags: ['airy', 'elegant', 'modern'], photo: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'BOTTOM', name: 'H&M 카멜 와이드 팬츠', hex: '#C69A66', seasons: ['AUTUMN_WARM'], genders: ['UNISEX'], tags: ['earthy', 'muted', 'cozy'], photo: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'BOTTOM', name: 'NIKE 블랙 조거 팬츠', hex: '#111114', seasons: ['WINTER_COOL'], genders: ['UNISEX'], tags: ['contrast', 'bold', 'street'], photo: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80' },
  // ---- 액세서리 ----
  { itemType: 'ACCESSORY', name: 'MANGO 터쿼이즈 스카프', hex: '#1FC0B4', seasons: ['SPRING_WARM'], genders: ['UNISEX'], tags: ['fresh', 'clear', 'bright'], photo: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'ACCESSORY', name: 'H&M 라벤더 머플러', hex: '#C9B8E1', seasons: ['SUMMER_COOL'], genders: ['UNISEX'], tags: ['soft', 'airy', 'romantic'], photo: 'https://images.unsplash.com/photo-1457545195570-67f207084966?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'ACCESSORY', name: 'UNIQLO 딥 틸 비니', hex: '#2F6F6F', seasons: ['AUTUMN_WARM'], genders: ['UNISEX'], tags: ['muted', 'natural', 'vintage'], photo: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'ACCESSORY', name: 'ZARA 에메랄드 머플러', hex: '#0E7F5C', seasons: ['WINTER_COOL'], genders: ['UNISEX'], tags: ['sharp', 'contrast', 'modern'], photo: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80' },
  // ---- 상의 추가 ----
  { itemType: 'TOP', name: 'H&M 피치 린넨 블라우스', hex: '#FAD3B2', seasons: ['SPRING_WARM'], genders: ['FEMALE', 'UNISEX'], tags: ['light', 'romantic', 'fresh'], photo: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'TOP', name: 'MANGO 라벤더 캐시미어 니트', hex: '#C9B8E1', seasons: ['SUMMER_COOL'], genders: ['UNISEX'], tags: ['soft', 'elegant', 'airy'], photo: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'TOP', name: "LEVI'S 러스트 데님 자켓", hex: '#B0552F', seasons: ['AUTUMN_WARM'], genders: ['UNISEX'], tags: ['earthy', 'vintage', 'street'], photo: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'TOP', name: 'ADIDAS 블랙 후드 집업', hex: '#111114', seasons: ['WINTER_COOL'], genders: ['UNISEX'], tags: ['bold', 'street', 'contrast'], photo: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80' },
  // ---- 하의 추가 ----
  { itemType: 'BOTTOM', name: 'UNIQLO 골든 옐로우 코튼 팬츠', hex: '#F1CB2A', seasons: ['SPRING_WARM'], genders: ['UNISEX'], tags: ['bright', 'casual', 'fresh'], photo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'BOTTOM', name: 'H&M 파우더 블루 데님', hex: '#B7D8E8', seasons: ['SUMMER_COOL'], genders: ['UNISEX'], tags: ['cool', 'casual', 'airy'], photo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'BOTTOM', name: 'ZARA 올리브 카고 팬츠', hex: '#8A8A3D', seasons: ['AUTUMN_WARM'], genders: ['UNISEX'], tags: ['earthy', 'street', 'natural'], photo: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'BOTTOM', name: 'MANGO 화이트 와이드 슬랙스', hex: '#F4F4F6', seasons: ['WINTER_COOL', 'SUMMER_COOL'], genders: ['UNISEX'], tags: ['sharp', 'elegant', 'modern'], photo: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80' },
  // ---- 액세서리 추가 ----
  { itemType: 'ACCESSORY', name: 'NIKE 웜 그린 볼캡', hex: '#86B08A', seasons: ['SPRING_WARM'], genders: ['UNISEX'], tags: ['casual', 'fresh', 'street'], photo: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'ACCESSORY', name: 'ZARA 로즈 핑크 토트백', hex: '#E9B1C3', seasons: ['SUMMER_COOL'], genders: ['FEMALE', 'UNISEX'], tags: ['romantic', 'soft', 'elegant'], photo: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'ACCESSORY', name: 'H&M 카멜 레더 벨트', hex: '#C69A66', seasons: ['AUTUMN_WARM'], genders: ['UNISEX'], tags: ['natural', 'vintage', 'muted'], photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { itemType: 'ACCESSORY', name: 'UNIQLO 아이스 블루 머플러', hex: '#9AC7E6', seasons: ['WINTER_COOL'], genders: ['UNISEX'], tags: ['cool', 'sharp', 'modern'], photo: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80' },
];

// v1 시드(SVG 일러스트) 아이템 — v2 실행 시 비활성화
const LEGACY_SEED_NAMES = [
  '코랄 블라우스', '파우더 블루 셔츠', '머스타드 니트 스웨터', '로열 블루 터틀넥',
  '웜 베이지 치노 팬츠', '쿨 그레이 슬랙스', '카멜 와이드 팬츠', '제트 블랙 슬림 진',
  '터쿼이즈 스카프', '라벤더 머플러', '딥 틸 비니', '에메랄드 머플러',
];

const main = async () => {
  const db = await mysql.createConnection({
    host: process.env.HAPROXY_DB_HOST,
    port: Number(process.env.HAPROXY_DB_PORT),
    user: process.env.HAPROXY_DB_USERNAME,
    password: process.env.HAPROXY_DB_PASSWORD,
    database: process.env.HAPROXY_DB_NAME,
  });

  const minio = new Minio.Client({
    endPoint: process.env.HAPROXY_MINIO_HOST,
    port: Number(process.env.HAPROXY_MINIO_PORT),
    useSSL: false,
    accessKey: process.env.HAPROXY_MINIO_ACCESS_KEY,
    secretKey: process.env.HAPROXY_MINIO_SECRET_KEY,
  });

  if (!(await minio.bucketExists(BUCKET))) {
    await minio.makeBucket(BUCKET);
    console.log(`버킷 생성: ${BUCKET}`);
  }

  // ---- 시즌 마스터 (멱등: seasonCode 유니크 기준 upsert) ----
  for (const s of SEASONS) {
    await db.execute(
      `INSERT INTO rn_default_personal_color (createdAt, seasonName, seasonCode, description, palette)
       VALUES (NOW(), ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE seasonName = VALUES(seasonName), description = VALUES(description), palette = VALUES(palette)`,
      [s.seasonName, s.seasonCode, s.description, JSON.stringify(s.palette)],
    );
  }
  console.log(`시즌 마스터 ${SEASONS.length}건 시드 완료`);

  // ---- v1 SVG 시드 비활성화 ----
  if (LEGACY_SEED_NAMES.length > 0) {
    const placeholders = LEGACY_SEED_NAMES.map(() => '?').join(',');
    const [legacy] = await db.execute(
      `UPDATE rn_default_pc_catalog_item SET activeYn = 0 WHERE name IN (${placeholders}) AND activeYn = 1`,
      LEGACY_SEED_NAMES,
    );
    if (legacy.affectedRows > 0) console.log(`구버전 시드 ${legacy.affectedRows}건 비활성화`);
  }

  // 실사 사진 다운로드 (실패 시 SVG 폴백)
  const fetchPhoto = async (item) => {
    try {
      const res = await fetch(item.photo, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return await sharp(buf).resize(800, 1000, { fit: 'cover' }).png().toBuffer();
    } catch (err) {
      console.warn(`  사진 다운로드 실패(${item.name}): ${err.message} → SVG 폴백`);
      return sharp(garmentSvg(item.itemType, item.hex, '#3D3A36')).png().toBuffer();
    }
  };

  // ---- 카탈로그 (멱등: name 기준 존재 시 스킵) ----
  let created = 0;
  for (const [i, item] of CATALOG.entries()) {
    const [rows] = await db.execute(
      `SELECT id FROM rn_default_pc_catalog_item WHERE name = ? AND deletedAt IS NULL AND activeYn = 1 LIMIT 1`,
      [item.name],
    );
    if (rows.length > 0) continue;

    const png = await fetchPhoto(item);
    const storageName = `seed-catalog-${randomUUID()}.png`;
    await minio.putObject(BUCKET, storageName, png, png.length, { 'Content-Type': 'image/png' });

    const fileId = randomUUID();
    await db.execute(
      `INSERT INTO rn_default_upload_file
        (createdAt, id, originalName, storageName, uploaderType, uploaderDetail, uploaderId, size, type, uploadIp, description, status, storageType)
       VALUES (NOW(), ?, ?, ?, 'ROOT_USER', 'SEED_SCRIPT', 'SEED', ?, 'image/png', 'LOCAL', ?, 'ACTIVE', 'MINIO')`,
      [fileId, `${item.name}.png`, storageName, png.length, `퍼스널 컬러 카탈로그 시드 이미지 - ${item.name}`],
    );

    await db.execute(
      `INSERT INTO rn_default_pc_catalog_item
        (createdAt, itemType, name, imageFileId, parsedAttributes, recommendedSeasons, recommendedGenders, dominantColorHex, styleTags, activeYn, sortNo)
       VALUES (NOW(), ?, ?, ?, NULL, ?, ?, ?, ?, 1, ?)`,
      [
        item.itemType,
        item.name,
        fileId,
        JSON.stringify(item.seasons),
        JSON.stringify(item.genders),
        item.hex,
        JSON.stringify(item.tags),
        i,
      ],
    );
    created += 1;
  }
  console.log(`카탈로그 아이템 ${created}건 신규 시드 (총 ${CATALOG.length}건 정의)`);

  await db.end();
  console.log('시드 완료 ✅');
};

main().catch((err) => {
  console.error('시드 실패:', err);
  process.exit(1);
});

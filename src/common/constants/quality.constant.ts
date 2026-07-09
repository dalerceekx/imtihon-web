import { VideoQuality } from '@prisma/client';

// Prisma enum qiymatlari harf bilan boshlanishi shart (240p kabi raqamdan boshlanadigan
// nom bo'lishi mumkin emas), shuning uchun sxemada "Q" prefiksi bilan saqlanadi.
// Bu obyekt orqali frontendga chiqishda haqiqiy ko'rinishga ("720p", "4K") o'giramiz.
export const QUALITY_LABELS: Record<VideoQuality, string> = {
  Q240: '240p',
  Q360: '360p',
  Q480: '480p',
  Q720: '720p',
  Q1080: '1080p',
  Q4K: '4K',
};

// Foydalanuvchi kiritgan "720p" kabi qiymatni qaytadan Prisma enumiga o'giradi
export const LABEL_TO_QUALITY: Record<string, VideoQuality> = {
  '240p': VideoQuality.Q240,
  '360p': VideoQuality.Q360,
  '480p': VideoQuality.Q480,
  '720p': VideoQuality.Q720,
  '1080p': VideoQuality.Q1080,
  '4K': VideoQuality.Q4K,
};

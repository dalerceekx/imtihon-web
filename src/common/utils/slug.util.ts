import slugify from 'slugify';

// "Qasoskorlar: Abadiyat Jangi" -> "qasoskorlar-abadiyat-jangi"
export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

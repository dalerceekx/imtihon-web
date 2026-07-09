import { Transform } from 'class-transformer';

// Kiritilgan qatordagi boshi/oxiridagi bo'sh joylarni olib tashlaydi
// (username/email kabi unique maydonlarda "ali" va "ali " turli qiymat sifatida saqlanib qolmasligi uchun)
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

// Barcha maydonlar ixtiyoriy - faqat yuborilgan maydonlar yangilanadi
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Role } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { AdminService } from './admin.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AddMovieFileDto } from './dto/add-movie-file.dto';

const posterStorage = diskStorage({
  destination: './src/uploads/posters',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.mimetype.split('/')[1]}`);
  },
});

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowed.includes(file.mimetype.split('/')[1])) {
    return cb(new UnsupportedMediaTypeException('Faqat rasm fayllariga ruxsat beriladi!'), false);
  }
  cb(null, true);
};

const movieFileStorage = diskStorage({
  destination: './src/uploads/movies',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.mimetype.split('/')[1]}`);
  },
});

const videoFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowed = ['mp4', 'x-matroska', 'webm', 'quicktime', 'x-msvideo'];
  if (!allowed.includes(file.mimetype.split('/')[1])) {
    return cb(new UnsupportedMediaTypeException('Faqat video fayllariga ruxsat beriladi!'), false);
  }
  cb(null, true);
};

@ApiTags('Admin - Movies')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/movies')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Barcha kinolar - admin ko\'rinishi (GET /api/admin/movies)' })
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @ApiOperation({ summary: 'Yangi kino qo\'shish (POST /api/admin/movies)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        release_year: { type: 'number' },
        duration_minutes: { type: 'number' },
        subscription_type: { type: 'string', enum: ['FREE', 'PREMIUM'] },
        category_ids: { type: 'array', items: { type: 'string' } },
        poster: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('poster', { storage: posterStorage, fileFilter: imageFileFilter }))
  create(
    @CurrentUser() user: JwtPayload,
    @Body() payload: CreateMovieDto,
    @UploadedFile() poster?: Express.Multer.File,
  ) {
    return this.adminService.create(payload, user.id, poster?.filename);
  }

  @ApiOperation({ summary: 'Kinoni yangilash (PUT /api/admin/movies/:movie_id)' })
  @ApiBody({ type: UpdateMovieDto })
  @Put(':movie_id')
  update(@Param('movie_id') movieId: string, @Body() payload: UpdateMovieDto) {
    return this.adminService.update(movieId, payload);
  }

  @ApiOperation({ summary: 'Kinoni o\'chirish (DELETE /api/admin/movies/:movie_id)' })
  @Delete(':movie_id')
  remove(@Param('movie_id') movieId: string) {
    return this.adminService.remove(movieId);
  }


  @ApiOperation({
    summary: 'Kinoga video fayl yuklash (POST /api/admin/movies/:movie_id/files)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        quality: { type: 'string', example: '720p' },
        language: { type: 'string', example: 'uz' },
      },
    },
  })
  @Post(':movie_id/files')
  @UseInterceptors(FileInterceptor('file', { storage: movieFileStorage, fileFilter: videoFileFilter }))
  addFile(
    @Param('movie_id') movieId: string,
    @Body() payload: AddMovieFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminService.addFile(movieId, payload, file);
  }
}

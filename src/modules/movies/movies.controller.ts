import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';

@ApiTags('Movies')

@UseGuards(OptionalAuthGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @ApiOperation({ summary: 'Kinolar ro\'yxati (GET /api/movies) - filter, qidiruv, pagination bilan' })
  @Get()
  findAll(@Query() query: MovieQueryDto) {
    return this.moviesService.findAll(query);
  }

  @ApiOperation({ summary: 'Barcha kinolar ro\'yxati (GET /api/movies/all)' })
  @Get('all')
  findAllApproved(@Query() query: MovieQueryDto) {
    return this.moviesService.findAll(query);
  }

  @ApiOperation({ summary: 'Bitta kino haqida to\'liq ma\'lumot (GET /api/movies/:slug)' })
  @Get(':slug')
  findOne(@Param('slug') slug: string, @CurrentUser() user: JwtPayload) {
    return this.moviesService.findBySlug(slug, user);
  }

  @ApiOperation({
    summary:
      "Kino videosini tomosha qilish (GET /api/movies/:movie_id/files/:file_id) - premium kino uchun faol obuna talab qilinadi",
  })
  @Get(':movie_id/files/:file_id')
  async streamFile(
    @Param('movie_id') movieId: string,
    @Param('file_id') fileId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const absolutePath = await this.moviesService.getFilePathForStreaming(movieId, fileId, user);
    res.sendFile(absolutePath);
  }
}

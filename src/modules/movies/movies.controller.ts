import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Bitta kino haqida to\'liq ma\'lumot (GET /api/movies/:slug)' })
  @Get(':slug')
  findOne(@Param('slug') slug: string, @CurrentUser() user: JwtPayload) {
    return this.moviesService.findBySlug(slug, user);
  }
}

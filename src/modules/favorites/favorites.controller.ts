import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/utils/jwt';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(AuthGuard) 
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @ApiOperation({ summary: 'Sevimli kinolar ro\'yxati ' })
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Kinoni sevimlilarga qo\'shish ' })
  @Post()
  add(@CurrentUser() user: JwtPayload, @Body() payload: AddFavoriteDto) {
    return this.favoritesService.add(user.id, payload.movie_id);
  }

  @ApiOperation({ summary: 'Kinoni sevimlilardan o\'chirish ' })
  @Delete(':movie_id')
  remove(@CurrentUser() user: JwtPayload, @Param('movie_id') movieId: string) {
    return this.favoritesService.remove(user.id, movieId);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './core/database/prisma.module';
import { JwtTokenModule } from './core/utils/jwt.module';
import { SeederModule } from './common/seeders/seeder.module';

import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MoviesModule } from './modules/movies/movies.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'uploads', 'posters'),
      serveRoot: '/uploads/posters',
    }),
    // Kino video fayllari ham statik manzildan beriladi - obuna tekshiruvi faqat
    // kino ma'lumotida (GET /movies/:slug) file_url ko'rsatish-ko'rsatmaslikda qo'llanadi
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'uploads', 'movies'),
      serveRoot: '/uploads/movies',
    }),
    ConfigModule.forRoot({ isGlobal: true }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),

    PrismaModule,
    JwtTokenModule,
    SeederModule,

    AuthModule,
    ProfileModule,
    SubscriptionsModule,
    CategoriesModule,
    MoviesModule,
    FavoritesModule,
    ReviewsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

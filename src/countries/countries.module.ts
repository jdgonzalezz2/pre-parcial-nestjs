import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { TravelPlan } from '../travel-plans/entities/travel-plan.entity';
import { RestCountriesProvider } from './providers/external-country.provider';
import { LoggingMiddleware } from '../common/middleware/logging.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Country, TravelPlan]), HttpModule],
  controllers: [CountriesController],
  providers: [
    CountriesService,
    RestCountriesProvider,
    {
      provide: 'COUNTRY_PROVIDER',
      useClass: RestCountriesProvider,
    },
  ],
  exports: [CountriesService],
})
export class CountriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes(CountriesController);
  }
}

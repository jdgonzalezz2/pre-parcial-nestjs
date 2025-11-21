import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelPlansController } from './travel-plans.controller';
import { TravelPlansService } from './travel-plans.service';
import { TravelPlan } from './entities/travel-plan.entity';
import { CountriesModule } from '../countries/countries.module';
import { LoggingMiddleware } from '../common/middleware/logging.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([TravelPlan]), CountriesModule],
  controllers: [TravelPlansController],
  providers: [TravelPlansService],
})
export class TravelPlansModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes(TravelPlansController);
  }
}

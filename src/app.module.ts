import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesModule } from './countries/countries.module';
import { TravelPlansModule } from './travel-plans/travel-plans.module';
import { Country } from './countries/entities/country.entity';
import { TravelPlan } from './travel-plans/entities/travel-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'travel-planner.db',
      entities: [Country, TravelPlan],
      synchronize: true, // En producción usar migraciones
      logging: false,
    }),
    CountriesModule,
    TravelPlansModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { RestCountriesProvider } from './providers/external-country.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Country]), HttpModule],
  controllers: [CountriesController],
  providers: [
    CountriesService,
    RestCountriesProvider,
    {
      provide: 'COUNTRY_PROVIDER',
      useClass: RestCountriesProvider,
    },
  ],
  exports: [CountriesService], // Exportar para que TravelPlansModule pueda usarlo
})
export class CountriesModule {}

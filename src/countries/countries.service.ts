import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CountryResponseDto } from './dto/country-response.dto';
import { ICountryProvider } from './providers/external-country.provider';
import { TravelPlan } from '../travel-plans/entities/travel-plan.entity';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(TravelPlan)
    private readonly travelPlanRepository: Repository<TravelPlan>,
    @Inject('COUNTRY_PROVIDER')
    private readonly externalCountryProvider: ICountryProvider,
  ) {}

  async findAll(): Promise<CountryResponseDto[]> {
    const countries = await this.countryRepository.find({
      order: { name: 'ASC' },
    });

    return countries.map((country) => ({
      ...country,
      source: 'cache' as const,
    }));
  }

  async findOneByCode(code: string): Promise<CountryResponseDto> {
    const cachedCountry = await this.countryRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (cachedCountry) {
      return {
        ...cachedCountry,
        source: 'cache',
      };
    }

    const externalCountry = await this.externalCountryProvider.getCountryByCode(
      code.toUpperCase(),
    );

    if (!externalCountry) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    const newCountry = this.countryRepository.create(externalCountry);
    const savedCountry = await this.countryRepository.save(newCountry);

    return {
      ...savedCountry,
      source: 'external',
    };
  }

  async ensureCountryExists(code: string): Promise<Country> {
    let country = await this.countryRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (country) {
      return country;
    }

    const externalCountry = await this.externalCountryProvider.getCountryByCode(
      code.toUpperCase(),
    );

    if (!externalCountry) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    country = this.countryRepository.create(externalCountry);
    return await this.countryRepository.save(country);
  }

  async remove(code: string): Promise<void> {
    const country = await this.countryRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    // Verificar si existen planes de viaje asociados a este país
    const associatedPlansCount = await this.travelPlanRepository.count({
      where: { countryCode: code.toUpperCase() },
    });

    if (associatedPlansCount > 0) {
      throw new BadRequestException(
        `Cannot delete country ${code} because it has associated travel plans`
      );
    }

    await this.countryRepository.remove(country);
  }
}

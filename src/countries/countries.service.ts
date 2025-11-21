import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CountryResponseDto } from './dto/country-response.dto';
import { ICountryProvider } from './providers/external-country.provider';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
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

    await this.countryRepository.remove(country);
  }
}

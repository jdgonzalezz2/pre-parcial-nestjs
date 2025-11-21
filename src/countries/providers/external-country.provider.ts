import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCountryDto } from '../dto/create-country.dto';

export interface ICountryProvider {
  getCountryByCode(code: string): Promise<CreateCountryDto | null>;
}

@Injectable()
export class RestCountriesProvider implements ICountryProvider {
  private readonly baseUrl = 'https://www.apicountries.com/countries';

  constructor(private readonly httpService: HttpService) {}

  async getCountryByCode(code: string): Promise<CreateCountryDto | null> {
    try {
      const response = await firstValueFrom(this.httpService.get(this.baseUrl));

      const countries = response.data;

      const countryData = countries.find(
        (country: any) => country.alpha3Code === code.toUpperCase(),
      );

      if (!countryData) {
        return null;
      }

      return {
        code: countryData.alpha3Code,
        name: countryData.name,
        region: countryData.region || null,
        subregion: countryData.subregion || null,
        capital: Array.isArray(countryData.capital)
          ? countryData.capital[0]
          : countryData.capital || null,
        population: countryData.population || 0,
        flagUrl: countryData.flags?.svg || countryData.flags?.png || null,
      };
    } catch (error) {
      console.error(
        `Error fetching country ${code} from ApiCountries (https://www.apicountries.com/countries):`,
        error.message,
      );
      return null;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCountryDto } from '../dto/create-country.dto';

export interface ICountryProvider {
  getCountryByCode(code: string): Promise<CreateCountryDto | null>;
}

@Injectable()
export class RestCountriesProvider implements ICountryProvider {
  private readonly baseUrl = 'https://restcountries.com/v3.1';

  constructor(private readonly httpService: HttpService) {}

  async getCountryByCode(code: string): Promise<CreateCountryDto | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/alpha/${code}`, {
          params: {
            fields: 'name,cca3,region,subregion,capital,population,flags',
          },
        }),
      );

      const data = response.data;

      if (!data || !data.cca3) {
        return null;
      }

      return {
        code: data.cca3,
        name: data.name?.common || data.name?.official || '',
        region: data.region || null,
        subregion: data.subregion || null,
        capital: Array.isArray(data.capital)
          ? data.capital[0]
          : data.capital || null,
        population: data.population || 0,
        flagUrl: data.flags?.png || data.flags?.svg || null,
      };
    } catch (error) {
      console.error(
        `Error fetching country ${code} from RestCountries:`,
        error.message,
      );
      return null;
    }
  }
}

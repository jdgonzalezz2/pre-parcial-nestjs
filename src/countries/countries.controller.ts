import {
  Controller,
  Get,
  Delete,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryResponseDto } from './dto/country-response.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CountryResponseDto[]> {
    return this.countriesService.findAll();
  }

  @Get(':code')
  @HttpCode(HttpStatus.OK)
  async findOneByCode(
    @Param('code') code: string,
  ): Promise<CountryResponseDto> {
    return this.countriesService.findOneByCode(code);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('code') code: string): Promise<{ message: string }> {
    await this.countriesService.remove(code);
    return {
      message: `Country with code ${code} has been deleted successfully`,
    };
  }
}

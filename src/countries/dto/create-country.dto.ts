import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  subregion?: string;

  @IsString()
  @IsOptional()
  capital?: string;

  @IsNumber()
  population: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  flagUrl?: string;
}

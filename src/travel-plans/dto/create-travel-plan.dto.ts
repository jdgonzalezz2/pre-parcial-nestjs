import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateTravelPlanDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Country code must be exactly 3 characters' })
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  @IsNotEmpty()
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

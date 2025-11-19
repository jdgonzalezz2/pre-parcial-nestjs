import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TravelPlansService } from './travel-plans.service';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelPlanResponseDto } from './dto/travel-plan-response.dto';

@Controller('travel-plans')
export class TravelPlansController {
  constructor(private readonly travelPlansService: TravelPlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTravelPlanDto: CreateTravelPlanDto,
  ): Promise<TravelPlanResponseDto> {
    return this.travelPlansService.create(createTravelPlanDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<TravelPlanResponseDto[]> {
    return this.travelPlansService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TravelPlanResponseDto> {
    return this.travelPlansService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.travelPlansService.remove(id);
    return { message: `Travel plan with ID ${id} has been deleted successfully` };
  }
}

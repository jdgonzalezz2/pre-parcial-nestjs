import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelPlan } from './entities/travel-plan.entity';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelPlanResponseDto } from './dto/travel-plan-response.dto';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class TravelPlansService {
  constructor(
    @InjectRepository(TravelPlan)
    private readonly travelPlanRepository: Repository<TravelPlan>,
    private readonly countriesService: CountriesService,
  ) {}

  async create(
    createTravelPlanDto: CreateTravelPlanDto,
  ): Promise<TravelPlanResponseDto> {
    const startDate = new Date(createTravelPlanDto.startDate);
    const endDate = new Date(createTravelPlanDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.countriesService.ensureCountryExists(
      createTravelPlanDto.countryCode,
    );

    const travelPlan = this.travelPlanRepository.create({
      countryCode: createTravelPlanDto.countryCode.toUpperCase(),
      title: createTravelPlanDto.title,
      startDate: startDate,
      endDate: endDate,
      notes: createTravelPlanDto.notes,
    });

    const savedPlan = await this.travelPlanRepository.save(travelPlan);
    return savedPlan;
  }

  async findAll(): Promise<TravelPlanResponseDto[]> {
    return this.travelPlanRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TravelPlanResponseDto> {
    const travelPlan = await this.travelPlanRepository.findOne({
      where: { id },
    });

    if (!travelPlan) {
      throw new NotFoundException(`Travel plan with ID ${id} not found`);
    }

    return travelPlan;
  }

  async remove(id: number): Promise<void> {
    const travelPlan = await this.travelPlanRepository.findOne({
      where: { id },
    });

    if (!travelPlan) {
      throw new NotFoundException(`Travel plan with ID ${id} not found`);
    }

    await this.travelPlanRepository.remove(travelPlan);
  }
}

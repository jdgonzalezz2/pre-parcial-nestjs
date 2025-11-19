import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('travel_plans')
export class TravelPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 3 })
  countryCode: string; // Código alpha-3 del país destino

  @Column()
  title: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}

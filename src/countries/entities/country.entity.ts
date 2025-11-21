import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryColumn({ length: 3 })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  subregion: string;

  @Column({ nullable: true })
  capital: string;

  @Column('bigint')
  population: number;

  @Column({ nullable: true })
  flagUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

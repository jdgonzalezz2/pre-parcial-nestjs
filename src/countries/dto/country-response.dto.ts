export class CountryResponseDto {
  code: string;
  name: string;
  region?: string;
  subregion?: string;
  capital?: string;
  population: number;
  flagUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  source: 'cache' | 'external'; // Indica el origen de la información
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly validApiKey = 'travel-planner-secret-key-2024'; // En producción, esto vendría de config

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (apiKey !== this.validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}

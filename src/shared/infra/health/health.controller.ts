import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HealthIndicatorService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@shared/infra/database/database.tokens.js';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @ApiOperation({ summary: 'Liveness probe: the process is up' })
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @ApiOperation({ summary: 'Readiness probe: the process and its dependencies are up' })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.checkDatabase()]);
  }

  private async checkDatabase() {
    const indicator = this.indicator.check('database');
    try {
      await this.dataSource.query('SELECT 1');
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: error instanceof Error ? error.message : String(error) });
    }
  }
}

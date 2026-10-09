import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import type { AuthenticatedAdmin } from '@admin/auth/application/services/admin-token-validator.js';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import { AdminRoles } from '@admin/auth/infra/http/decorators/admin-roles.decorator.js';
import { CurrentAdmin } from '@admin/auth/infra/http/decorators/current-admin.decorator.js';
import { AdminAuthGuard } from '@admin/auth/infra/http/guards/admin-auth.guard.js';
import { AdminApiKeysService } from '../../services/admin-api-keys.service.js';
import { ApiKeyIdParams } from '../dto/request/api-key-id.params.js';
import { CreateApiKeyRequest } from '../dto/request/create-api-key.request.js';
import { ApiKeyResponse } from '../dto/response/api-key.response.js';
import { CreateApiKeyResponse } from '../dto/response/create-api-key.response.js';

@ApiTags('API keys')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminAuthGuard)
@AdminRoles(AdminRole.ADMIN)
@Controller('admin/api-keys')
export class AdminApiKeysController {
  constructor(private readonly apiKeysService: AdminApiKeysService) {}

  @ApiOperation({ summary: 'List API keys' })
  @ZodResponse({ status: HttpStatus.OK, type: [ApiKeyResponse] })
  @Get()
  list() {
    return this.apiKeysService.list();
  }

  @ApiOperation({ summary: 'Create an API key. The key is returned only once.' })
  @ZodResponse({ status: HttpStatus.CREATED, type: CreateApiKeyResponse })
  @Post()
  create(@Body() body: CreateApiKeyRequest, @CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.apiKeysService.create({ name: body.name, createdBy: admin.id });
  }

  @ApiOperation({ summary: 'Deactivate an API key' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/deactivate')
  async deactivate(@Param() params: ApiKeyIdParams): Promise<void> {
    await this.apiKeysService.deactivate({ id: params.id });
  }

  @ApiOperation({ summary: 'Delete an API key' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param() params: ApiKeyIdParams): Promise<void> {
    await this.apiKeysService.delete({ id: params.id });
  }
}

import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import { AdminRoles } from '../decorators/admin-roles.decorator.js';
import { CreateAdminUserRequest } from '../dto/request/create-admin-user.request.js';
import { AdminUserResponse } from '../dto/response/admin-user.response.js';
import { AdminAuthService } from '../../services/admin-auth.service.js';
import { AdminAuthGuard } from '../guards/admin-auth.guard.js';

@ApiTags('Admin users')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminAuthGuard)
@AdminRoles(AdminRole.SUPER_ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiOperation({ summary: 'List admin users' })
  @ZodResponse({ status: HttpStatus.OK, type: [AdminUserResponse] })
  @Get()
  list() {
    return this.adminAuthService.listAdminUsers();
  }

  @ApiOperation({ summary: 'Create an admin user' })
  @ZodResponse({ status: HttpStatus.CREATED, type: AdminUserResponse })
  @Post()
  create(@Body() body: CreateAdminUserRequest) {
    return this.adminAuthService.createAdminUser(body);
  }
}

import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAllUsers({ limit, offset });
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete a user' })
  async deleteUser(@Param('userId') userId: string) {
    await this.adminService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  @Patch('users/:userId/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: 'USER' | 'ADMIN' },
  ) {
    return this.adminService.updateUserRole(userId, body.role);
  }
}

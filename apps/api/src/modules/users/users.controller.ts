import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const fullUser = await this.usersService.findById(user.sub);
    return {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      createdAt: fullUser.createdAt,
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() data: { name?: string },
  ) {
    return this.usersService.updateProfile(user.sub, data);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@CurrentUser() user: JwtPayload) {
    return this.usersService.getPreferences(user.sub);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() data: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(user.sub, data);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account' })
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    await this.usersService.deleteUser(user.sub);
    return { message: 'Account deleted successfully' };
  }
}

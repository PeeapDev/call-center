import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { HrService } from './hr.service';

class CreateUserDto {
  phoneNumber: string;
  password: string;
  name: string;
  accountType: 'admin' | 'supervisor' | 'agent' | 'analyst' | 'auditor' | 'citizen';
  userCategory?: string;
  extension?: string;
  skills?: string[];
  isActive?: boolean;
}

class UpdateUserDto {
  phoneNumber?: string;
  password?: string;
  name?: string;
  accountType?: string;
  userCategory?: string;
  extension?: string;
  skills?: string[];
  isActive?: boolean;
}

class UpdateWebRTCConfigDto {
  stunServer: string;
  turnServer?: string;
  turnUsername?: string;
  turnPassword?: string;
  asteriskWsUrl: string;
}

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // Create new user/agent
  @Post('users')
  async createUser(@Body() dto: CreateUserDto) {
    try {
      const user = await this.hrService.createUser(dto);
      
      // Don't send SIP password in response (only show once)
      const response: any = { ...user };
      if (response.sipPassword) {
        response.sipPasswordGenerated = true;
      }
      
      return {
        status: 'ok',
        user: response,
        message: user.sipUsername 
          ? `Agent created with SIP credentials. Extension: ${user.sipExtension}`
          : 'User created successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get all users
  @Get('users')
  async getUsers(
    @Query('accountType') accountType?: string,
    @Query('isActive') isActive?: string,
    @Query('userCategory') userCategory?: string,
  ) {
    try {
      const filters: any = {};
      
      if (accountType) filters.accountType = accountType;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (userCategory) filters.userCategory = userCategory;

      const users = await this.hrService.getUsers(filters);
      
      // Remove SIP passwords from response
      const sanitizedUsers = users.map(user => {
        const { sipPassword, ...rest } = user as any;
        return { ...rest, hasSipCredentials: !!sipPassword };
      });

      return {
        status: 'ok',
        users: sanitizedUsers,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get user by ID
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.hrService.getUserById(id);
      
      if (!user) {
        return {
          status: 'error',
          message: 'User not found',
        };
      }

      // Remove SIP password
      const { sipPassword, ...rest } = user as any;
      
      return {
        status: 'ok',
        user: { ...rest, hasSipCredentials: !!sipPassword },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Update user
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    try {
      const user = await this.hrService.updateUser(id, dto);
      
      // Remove SIP password
      const { sipPassword, ...rest } = user as any;
      
      return {
        status: 'ok',
        user: { ...rest, hasSipCredentials: !!sipPassword },
        message: 'User updated successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Delete user
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.hrService.deleteUser(id);
      
      return {
        status: 'ok',
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Regenerate SIP credentials for agent
  @Post('users/:id/regenerate-sip')
  async regenerateSIPCredentials(@Param('id') id: string) {
    try {
      const user = await this.hrService.regenerateSIPCredentials(id);
      
      return {
        status: 'ok',
        user: user,
        message: 'SIP credentials regenerated',
        sipCredentials: {
          username: user.sipUsername,
          password: user.sipPassword,
          extension: user.sipExtension,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get WebRTC configuration
  @Get('webrtc-config')
  async getWebRTCConfig() {
    try {
      const config = await this.hrService.getWebRTCConfig();
      
      return {
        status: 'ok',
        config,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Update WebRTC configuration
  @Put('webrtc-config')
  async updateWebRTCConfig(@Body() dto: UpdateWebRTCConfigDto) {
    try {
      const config = await this.hrService.updateWebRTCConfig(dto);
      
      return {
        status: 'ok',
        config,
        message: 'WebRTC configuration updated',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

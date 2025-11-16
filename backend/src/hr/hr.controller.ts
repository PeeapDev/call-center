import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import { AgentStatusType } from './agent-status.entity';

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

class UpdateAgentStatusDto {
  status: AgentStatusType;
  currentCallId?: string;
}

class LoginDto {
  phoneNumber: string;
  password: string;
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

  // Login - verify phone number and password
  @Post('users/login')
  async login(@Body() dto: LoginDto) {
    try {
      const user = await this.hrService.verifyCredentials(dto.phoneNumber, dto.password);
      
      if (!user) {
        return {
          status: 'error',
          message: 'Invalid phone number or password',
        };
      }

      // Remove sensitive data
      const { sipPassword, password, ...userWithoutPassword } = user as any;

      return {
        status: 'ok',
        user: userWithoutPassword,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Invalid phone number or password',
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

  // Agent Status Management Endpoints

  // Update agent status
  @Put('agents/:agentId/status')
  async updateAgentStatus(@Param('agentId') agentId: string, @Body() dto: UpdateAgentStatusDto) {
    try {
      await this.hrService.updateAgentStatus(agentId, dto.status, dto.currentCallId);

      return {
        status: 'ok',
        message: `Agent status updated to ${dto.status}`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get agent status
  @Get('agents/:agentId/status')
  async getAgentStatus(@Param('agentId') agentId: string) {
    try {
      const status = await this.hrService.getAgentStatus(agentId);

      return {
        status: 'ok',
        agentStatus: status,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get all agent statuses
  @Get('agents/status')
  async getAllAgentStatuses() {
    try {
      const statuses = await this.hrService.getAllAgentStatuses();

      return {
        status: 'ok',
        agentStatuses: statuses,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get available agents
  @Get('agents/available')
  async getAvailableAgents(@Query('agentIds') agentIds?: string) {
    try {
      const ids = agentIds ? agentIds.split(',') : undefined;
      const agents = await this.hrService.getAvailableAgents(ids);

      return {
        status: 'ok',
        availableAgents: agents,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get next available agent from list
  @Post('agents/next-available')
  async getNextAvailableAgent(@Body() body: { agentIds: string[] }) {
    try {
      const agent = await this.hrService.getNextAvailableAgent(body.agentIds);

      return {
        status: 'ok',
        nextAgent: agent,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get agents with their current status
  @Get('agents/with-status')
  async getAgentsWithStatus(@Query('agentIds') agentIds?: string) {
    try {
      const ids = agentIds ? agentIds.split(',') : undefined;
      const agents = await this.hrService.getAgentsWithStatus(ids);

      return {
        status: 'ok',
        agents: agents,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Mark agent as busy
  @Post('agents/:agentId/busy')
  async markAgentBusy(@Param('agentId') agentId: string, @Body() body: { callId: string }) {
    try {
      await this.hrService.markAgentBusy(agentId, body.callId);

      return {
        status: 'ok',
        message: 'Agent marked as busy',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Mark agent as available
  @Post('agents/:agentId/available')
  async markAgentAvailable(@Param('agentId') agentId: string) {
    try {
      await this.hrService.markAgentAvailable(agentId);

      return {
        status: 'ok',
        message: 'Agent marked as available',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student, StudentCase, StudentStatus, EducationLevel } from './student.entity';

class CreateStudentDto {
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  district?: string;
  chiefdom?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  schoolName?: string;
  schoolCode?: string;
  educationLevel?: EducationLevel;
  currentClass?: string;
  enrollmentYear?: number;
}

class CreateCaseDto {
  studentId: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
}

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // Student Endpoints
  @Post()
  async createStudent(@Body() dto: CreateStudentDto) {
    try {
      const student = await this.studentsService.createStudent({
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
      });
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get()
  async findAllStudents(
    @Query('search') search?: string,
    @Query('status') status?: StudentStatus,
    @Query('educationLevel') educationLevel?: EducationLevel,
    @Query('district') district?: string,
    @Query('schoolCode') schoolCode?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const result = await this.studentsService.findAllStudents({
        search,
        status,
        educationLevel,
        district,
        schoolCode,
        limit: limit ? parseInt(String(limit)) : undefined,
        offset: offset ? parseInt(String(offset)) : undefined,
      });
      return { status: 'ok', ...result };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('stats')
  async getStudentStats() {
    try {
      const stats = await this.studentsService.getStudentStats();
      return { status: 'ok', stats };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('search/:query')
  async searchStudents(@Param('query') query: string) {
    try {
      const result = await this.studentsService.findAllStudents({ search: query, limit: 20 });
      return { status: 'ok', students: result.students };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('by-phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    try {
      const student = await this.studentsService.findStudentByPhone(phone);
      if (!student) {
        return { status: 'ok', student: null, message: 'Student not found' };
      }
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('by-student-id/:studentId')
  async findByStudentId(@Param('studentId') studentId: string) {
    try {
      const student = await this.studentsService.findStudentByStudentId(studentId);
      if (!student) {
        return { status: 'ok', student: null, message: 'Student not found' };
      }
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get(':id')
  async findStudentById(@Param('id') id: string) {
    try {
      const student = await this.studentsService.findStudentById(id);
      if (!student) {
        return { status: 'error', message: 'Student not found' };
      }
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Put(':id')
  async updateStudent(@Param('id') id: string, @Body() dto: Partial<CreateStudentDto>) {
    try {
      const updateData: any = { ...dto };
      if (dto.dateOfBirth) {
        updateData.dateOfBirth = new Date(dto.dateOfBirth);
      }
      const student = await this.studentsService.updateStudent(id, updateData);
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Delete(':id')
  async deleteStudent(@Param('id') id: string) {
    try {
      await this.studentsService.deleteStudent(id);
      return { status: 'ok', message: 'Student deleted' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/issues')
  async addIssue(
    @Param('id') id: string,
    @Body() dto: { type: string; description: string },
  ) {
    try {
      const student = await this.studentsService.addStudentIssue(id, dto);
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/link-call')
  async linkCall(@Param('id') id: string, @Body() dto: { callId: string }) {
    try {
      const student = await this.studentsService.linkCallToStudent(id, dto.callId);
      return { status: 'ok', student };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Case Endpoints
  @Post('cases')
  async createCase(@Body() dto: CreateCaseDto) {
    try {
      const studentCase = await this.studentsService.createCase(dto);
      return { status: 'ok', case: studentCase };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('cases/all')
  async findAllCases(
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('priority') priority?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const result = await this.studentsService.findAllCases({
        studentId,
        status,
        category,
        assignedAgentId,
        priority,
        limit: limit ? parseInt(String(limit)) : undefined,
        offset: offset ? parseInt(String(offset)) : undefined,
      });
      return { status: 'ok', ...result };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('cases/stats')
  async getCaseStats() {
    try {
      const stats = await this.studentsService.getCaseStats();
      return { status: 'ok', stats };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('cases/:id')
  async findCaseById(@Param('id') id: string) {
    try {
      const studentCase = await this.studentsService.findCaseById(id);
      if (!studentCase) {
        return { status: 'error', message: 'Case not found' };
      }
      return { status: 'ok', case: studentCase };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Put('cases/:id')
  async updateCase(
    @Param('id') id: string,
    @Body() dto: { status?: string; priority?: string; resolution?: string; agentId?: string; agentName?: string },
  ) {
    try {
      const studentCase = await this.studentsService.updateCase(
        id,
        { status: dto.status, priority: dto.priority, resolution: dto.resolution },
        dto.agentId,
        dto.agentName,
      );
      return { status: 'ok', case: studentCase };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post('cases/:id/assign')
  async assignCase(
    @Param('id') id: string,
    @Body() dto: { agentId: string; agentName: string },
  ) {
    try {
      const studentCase = await this.studentsService.assignCase(id, dto.agentId, dto.agentName);
      return { status: 'ok', case: studentCase };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post('cases/:id/update')
  async addCaseUpdate(
    @Param('id') id: string,
    @Body() dto: { agentId: string; agentName: string; message: string },
  ) {
    try {
      const studentCase = await this.studentsService.addCaseUpdate(
        id,
        dto.agentId,
        dto.agentName,
        dto.message,
      );
      return { status: 'ok', case: studentCase };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

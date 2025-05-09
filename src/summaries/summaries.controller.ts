import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { MonthlySummaryDto } from './dto/monthly-summary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get('monthly')
  getMonthlySummary(
    @Query() monthlySummaryDto: MonthlySummaryDto,
    @GetUser() user: User,
  ) {
    return this.summariesService.getMonthlySummary(
      user.id,
      monthlySummaryDto.month,
      monthlySummaryDto.year,
    );
  }
} 
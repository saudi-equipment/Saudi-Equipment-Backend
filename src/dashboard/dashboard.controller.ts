import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from 'src/auth/guard/roles.gurad';
import { UserRole } from 'src/enums';
import { Roles } from 'src/decorators/roles.decorator';
import { query } from 'express';
import { EarningsReportDto } from './dtos/earning.report.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('total')
  async calculateTotalMetrics() {
    return await this.dashboardService.calculateTotalMetrics();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('weekly')
  async getSubscriptionPricesWeekly() {
    return await this.dashboardService.getSubscriptionPricesWeekly();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('reports')
  async getEarningsReport(@Query('period') period?: string) {
    
    let periodType: 'month' | 'year' = 'year';
    let periodValue: string | undefined;

    if (period) {
      if (period.includes('-')) {
        periodType = 'month';
        periodValue = period;
      } else if (/^\d{4}$/.test(period)) {
        periodType = 'year';
        periodValue = period;
      }
    }

    return this.dashboardService.getEarningsReport(periodType, periodValue);
  }
}

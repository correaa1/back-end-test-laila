import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);
  
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
  ) {
    return this.transactionsService.create(createTransactionDto, user.id);
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    this.logger.log(`Buscando transações com filtros: categoryId=${categoryId}, type=${type}, startDate=${startDate}, endDate=${endDate}, page=${page}, pageSize=${pageSize}`);
    
    return this.transactionsService.findAll(user.id, { 
      categoryId, 
      type,
      startDate,
      endDate,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.transactionsService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @GetUser() user: User,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.transactionsService.remove(id, user.id);
  }
} 
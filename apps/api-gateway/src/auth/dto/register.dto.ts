import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: 'password123', description: '密码，最少6位' })
  @IsString()
  @MinLength(6, { message: '密码长度至少6位' })
  password: string;

  @ApiProperty({ example: '张三', description: '用户姓名' })
  @IsString()
  @MinLength(2, { message: '姓名长度至少2位' })
  name: string;

  @ApiPropertyOptional({ example: '13800138000', description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;
}

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '原密码' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '新密码，最少6位' })
  @IsString()
  @MinLength(6, { message: '新密码长度至少6位' })
  newPassword: string;
}

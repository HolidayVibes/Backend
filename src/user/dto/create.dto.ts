import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { FormatDate } from 'src/common/decorators/formatDate.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  passwordHash: string;
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @FormatDate()
  birthDate: string;
}

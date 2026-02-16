import { IsString, IsOptional } from 'class-validator';
import { FormatDate } from 'src/common/decorators/formatDate.decorator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
}

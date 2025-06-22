import { IsString, Length } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @Length(3, 50)
  name: string;
}

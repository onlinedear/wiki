import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchCommentDto {
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsOptional()
  @IsString()
  searchText?: string;

  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  resolved?: boolean;
}

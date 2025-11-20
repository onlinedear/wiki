import { IsNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetNotificationsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  unreadOnly?: boolean;
}

export class MarkNotificationReadDto {
  @IsNotEmpty()
  @IsUUID()
  notificationId: string;
}

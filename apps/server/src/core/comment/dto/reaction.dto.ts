import { IsNotEmpty, IsString, IsUUID, IsIn } from 'class-validator';

export class AddReactionDto {
  @IsNotEmpty()
  @IsUUID()
  commentId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['like', 'love', 'laugh', 'surprised', 'sad', 'angry'])
  reactionType: string;
}

export class RemoveReactionDto {
  @IsNotEmpty()
  @IsUUID()
  commentId: string;

  @IsNotEmpty()
  @IsString()
  reactionType: string;
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { SearchCommentDto } from './dto/search-comment.dto';
import { AddReactionDto, RemoveReactionDto } from './dto/reaction.dto';
import {
  GetNotificationsDto,
  MarkNotificationReadDto,
} from './dto/notification.dto';
import { PageIdDto, CommentIdDto } from './dto/comments.input';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { AuthWorkspace } from '../../common/decorators/auth-workspace.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationOptions } from '@docmost/db/pagination/pagination-options';
import { User, Workspace } from '@docmost/db/types/entity.types';
import SpaceAbilityFactory from '../casl/abilities/space-ability.factory';
import { PageRepo } from '@docmost/db/repos/page/page.repo';
import {
  SpaceCaslAction,
  SpaceCaslSubject,
} from '../casl/interfaces/space-ability.type';
import { CommentRepo } from '@docmost/db/repos/comment/comment.repo';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentRepo: CommentRepo,
    private readonly pageRepo: PageRepo,
    private readonly spaceAbility: SpaceAbilityFactory,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('create')
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const page = await this.pageRepo.findById(createCommentDto.pageId);
    if (!page || page.deletedAt) {
      throw new NotFoundException('Page not found');
    }

    const ability = await this.spaceAbility.createForUser(user, page.spaceId);
    if (ability.cannot(SpaceCaslAction.Create, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.commentService.create(
      {
        userId: user.id,
        page,
        workspaceId: workspace.id,
      },
      createCommentDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('/')
  async findPageComments(
    @Body() input: PageIdDto,
    @Body()
    pagination: PaginationOptions,
    @AuthUser() user: User,
  ) {
    const page = await this.pageRepo.findById(input.pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const ability = await this.spaceAbility.createForUser(user, page.spaceId);
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }
    return this.commentService.findByPageId(page.id, pagination);
  }

  @HttpCode(HttpStatus.OK)
  @Post('info')
  async findOne(@Body() input: CommentIdDto, @AuthUser() user: User) {
    const comment = await this.commentRepo.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const ability = await this.spaceAbility.createForUser(
      user,
      comment.spaceId,
    );
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }
    return comment;
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async update(@Body() dto: UpdateCommentDto, @AuthUser() user: User) {
    const comment = await this.commentRepo.findById(dto.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const ability = await this.spaceAbility.createForUser(
      user,
      comment.spaceId,
    );

    // must be a space member with edit permission
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException(
        'You must have space edit permission to edit comments',
      );
    }

    return this.commentService.update(comment, dto, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async delete(@Body() input: CommentIdDto, @AuthUser() user: User) {
    const comment = await this.commentRepo.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const ability = await this.spaceAbility.createForUser(
      user,
      comment.spaceId,
    );

    // must be a space member with edit permission
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    // Check if user is the comment owner
    const isOwner = comment.creatorId === user.id;

    if (isOwner) {
      /*
      // Check if comment has children from other users
      const hasChildrenFromOthers =
        await this.commentRepo.hasChildrenFromOtherUsers(comment.id, user.id);

      // Owner can delete if no children from other users
      if (!hasChildrenFromOthers) {
        await this.commentRepo.deleteComment(comment.id);
        return;
      }

      // If has children from others, only space admin can delete
      if (ability.cannot(SpaceCaslAction.Manage, SpaceCaslSubject.Settings)) {
        throw new ForbiddenException(
          'Only space admins can delete comments with replies from other users',
        );
      }*/
      await this.commentRepo.deleteComment(comment.id);
      return;
    }

    // Space admin can delete any comment
    if (ability.cannot(SpaceCaslAction.Manage, SpaceCaslSubject.Settings)) {
      throw new ForbiddenException(
        'You can only delete your own comments or must be a space admin',
      );
    }
    await this.commentRepo.deleteComment(comment.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('search')
  async search(
    @Body() searchDto: SearchCommentDto,
    @Body() pagination: PaginationOptions,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.commentService.searchComments(
      searchDto,
      workspace.id,
      pagination,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('reactions/add')
  async addReaction(@Body() dto: AddReactionDto, @AuthUser() user: User) {
    const comment = await this.commentRepo.findById(dto.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const ability = await this.spaceAbility.createForUser(
      user,
      comment.spaceId,
    );
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.commentService.addReaction(
      dto.commentId,
      user.id,
      dto.reactionType,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('reactions/remove')
  async removeReaction(@Body() dto: RemoveReactionDto, @AuthUser() user: User) {
    const comment = await this.commentRepo.findById(dto.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentService.removeReaction(
      dto.commentId,
      user.id,
      dto.reactionType,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('reactions')
  async getReactions(@Body() input: CommentIdDto, @AuthUser() user: User) {
    const comment = await this.commentRepo.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentService.getCommentReactions(input.commentId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('notifications')
  async getNotifications(
    @Body() dto: GetNotificationsDto,
    @AuthUser() user: User,
  ) {
    return this.commentService.getUserNotifications(user.id, dto.unreadOnly);
  }

  @HttpCode(HttpStatus.OK)
  @Get('notifications/unread-count')
  async getUnreadCount(@AuthUser() user: User) {
    const count = await this.commentService.getUnreadNotificationCount(
      user.id,
    );
    return { count };
  }

  @HttpCode(HttpStatus.OK)
  @Post('notifications/mark-read')
  async markNotificationRead(
    @Body() dto: MarkNotificationReadDto,
    @AuthUser() user: User,
  ) {
    return this.commentService.markNotificationAsRead(dto.notificationId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('notifications/mark-all-read')
  async markAllNotificationsRead(@AuthUser() user: User) {
    return this.commentService.markAllNotificationsAsRead(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('workspace/list')
  async getWorkspaceComments(
    @Body() dto: any,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    // Only workspace admins can access this
    if (user.role !== 'admin' && user.role !== 'owner') {
      throw new ForbiddenException('Only workspace admins can manage comments');
    }

    return this.commentService.getWorkspaceComments(workspace.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('workspace/delete-batch')
  async deleteBatchComments(
    @Body() dto: { commentIds: string[] },
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    // Only workspace admins can access this
    if (user.role !== 'admin' && user.role !== 'owner') {
      throw new ForbiddenException('Only workspace admins can manage comments');
    }

    return this.commentService.deleteBatchComments(dto.commentIds, workspace.id);
  }
}

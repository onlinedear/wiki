import { BadRequestException } from '@nestjs/common';
import { Workspace } from '@notedoc/db/types/entity.types';

export function validateSsoEnforcement(workspace: Workspace) {
  if (workspace.enforceSso) {
    throw new BadRequestException('此工作空间已强制使用 SSO 登录。');
  }
}

export function validateAllowedEmail(userEmail: string, workspace: Workspace) {
  const emailParts = userEmail.split('@');
  const emailDomain = emailParts[1].toLowerCase();
  if (
    workspace.emailDomains?.length > 0 &&
    !workspace.emailDomains.includes(emailDomain)
  ) {
    throw new BadRequestException(
      `邮箱域名 "${emailDomain}" 未被此工作空间允许。`,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { PageHistoryRepo } from '@notedoc/db/repos/page/page-history.repo';
import { PageHistory } from '@notedoc/db/types/entity.types';
import { PaginationOptions } from '@notedoc/db/pagination/pagination-options';
import { PaginationResult } from '@notedoc/db/pagination/pagination';

@Injectable()
export class PageHistoryService {
  constructor(private pageHistoryRepo: PageHistoryRepo) {}

  async findById(historyId: string): Promise<PageHistory> {
    return await this.pageHistoryRepo.findById(historyId);
  }

  async findHistoryByPageId(
    pageId: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginationResult<any>> {
    const pageHistory = await this.pageHistoryRepo.findPageHistoryByPageId(
      pageId,
      paginationOptions,
    );

    return pageHistory;
  }
}

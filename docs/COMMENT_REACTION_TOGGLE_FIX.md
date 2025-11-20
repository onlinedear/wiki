# 评论反馈切换功能修复

## 问题描述

评论下方的点赞（Like）和爱心（Love）等反馈功能只能点亮，但不能取消。用户点击后无法再次点击来取消反馈。

## 问题分析

经过代码审查，发现以下潜在问题：

1. **服务端重复插入问题**：`addReaction` 方法没有检查反馈是否已存在，可能导致重复插入错误
2. **前端竞态条件**：用户快速点击时，可能在 mutation 执行期间触发多次请求

## 解决方案

### 1. 服务端修改

**文件**: `apps/server/src/database/repos/comment/comment-reaction.repo.ts`

在 `addReaction` 方法中添加了重复检查逻辑：

```typescript
async addReaction(data: {
  commentId: string;
  userId: string;
  reactionType: string;
}) {
  // Check if reaction already exists
  const existing = await this.db
    .selectFrom('commentReactions')
    .selectAll()
    .where('commentId', '=', data.commentId)
    .where('userId', '=', data.userId)
    .where('reactionType', '=', data.reactionType)
    .executeTakeFirst();

  if (existing) {
    return existing;
  }

  return await this.db
    .insertInto('commentReactions')
    .values({
      commentId: data.commentId,
      userId: data.userId,
      reactionType: data.reactionType,
    })
    .returningAll()
    .executeTakeFirst();
}
```

**优点**：
- 防止数据库唯一约束冲突错误
- 幂等性：多次调用相同参数返回相同结果
- 不会因为重复点击而抛出错误

### 2. 前端修改

**文件**: `apps/client/src/features/comment/components/comment-reactions.tsx`

在 `handleReaction` 函数中添加了防抖保护：

```typescript
const handleReaction = (reactionType: string) => {
  // Prevent multiple clicks while mutation is in progress
  if (addReactionMutation.isPending || removeReactionMutation.isPending) {
    return;
  }

  if (userReactions.includes(reactionType)) {
    removeReactionMutation.mutate({ commentId, reactionType });
  } else {
    addReactionMutation.mutate({ commentId, reactionType });
  }
};
```

**优点**：
- 防止用户快速点击导致的竞态条件
- 提升用户体验，避免意外的多次请求
- 确保 UI 状态与服务器状态一致

## 功能验证

### 自动化测试

运行测试脚本：

```bash
./scripts/test-comment-reactions.sh
```

### 手动测试步骤

1. 打开页面：http://localhost:5174/s/store/p/1117-bMgW0emznk
2. 找到一条评论
3. 点击任意反馈图标（如 Like 或 Love）
4. 验证：
   - 图标变为高亮状态（filled variant）
   - 计数器增加 1
5. 再次点击相同的图标
6. 验证：
   - 图标变回普通状态（subtle variant）
   - 计数器减少 1
7. 重复步骤 3-6 多次，确保切换功能稳定

### 预期行为

- ✅ 点击未激活的反馈图标 → 图标高亮，计数+1
- ✅ 点击已激活的反馈图标 → 图标变暗，计数-1
- ✅ 快速多次点击 → 不会出现错误或状态不一致
- ✅ 多个用户同时点击 → 每个用户的状态独立管理
- ✅ 刷新页面后 → 反馈状态正确保持

## 技术细节

### 数据库结构

表名：`comment_reactions`

字段：
- `id`: UUID (主键)
- `comment_id`: UUID (外键 → comments.id)
- `user_id`: UUID (外键 → users.id)
- `reaction_type`: VARCHAR(50)
- `created_at`: TIMESTAMPTZ

唯一约束：`(comment_id, user_id, reaction_type)`

### API 端点

1. **添加反馈**
   - 端点：`POST /comments/reactions/add`
   - 请求体：`{ commentId: string, reactionType: string }`
   - 响应：反馈记录对象

2. **移除反馈**
   - 端点：`POST /comments/reactions/remove`
   - 请求体：`{ commentId: string, reactionType: string }`
   - 响应：空

3. **获取评论反馈**
   - 端点：`POST /comments/reactions`
   - 请求体：`{ commentId: string }`
   - 响应：反馈记录数组

### 前端状态管理

使用 React Query 进行状态管理：

- `useCommentReactionsQuery`: 获取评论的所有反馈
- `useAddReactionMutation`: 添加反馈
- `useRemoveReactionMutation`: 移除反馈

mutation 成功后会自动 invalidate 相关查询，触发数据重新获取。

## 注意事项

1. **权限检查**：用户必须有评论所在空间的读取权限才能添加反馈
2. **性能优化**：考虑添加乐观更新以提升用户体验
3. **通知功能**：添加反馈时会创建通知给评论作者（如果不是自己的评论）

## 后续优化建议

1. **乐观更新**：在 mutation 执行前立即更新 UI，失败时回滚
2. **防抖/节流**：添加更精细的防抖控制
3. **动画效果**：添加平滑的过渡动画
4. **批量操作**：支持一次性添加/移除多个反馈
5. **反馈详情**：显示谁点了哪些反馈

## 相关文件

- `apps/server/src/core/comment/comment.controller.ts`
- `apps/server/src/core/comment/comment.service.ts`
- `apps/server/src/database/repos/comment/comment-reaction.repo.ts`
- `apps/client/src/features/comment/components/comment-reactions.tsx`
- `apps/client/src/features/comment/queries/comment-query.ts`
- `apps/client/src/features/comment/services/comment-service.ts`
- `apps/server/src/database/migrations/20251118T100000-enhance-comments.ts`

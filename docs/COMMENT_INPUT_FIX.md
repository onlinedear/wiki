# 评论输入框修复

## 问题描述

用户打开评论侧边栏时，没有看到创建新评论的输入框。

## 原因分析

原有的评论列表组件 (`comment-list-with-tabs.tsx`) 只显示现有评论的列表和回复功能，但没有在顶部提供创建新评论的输入框。

创建新评论的功能只能通过以下方式：
1. 在编辑器中选择文本
2. 弹出评论对话框
3. 在对话框中输入评论

这对于想要直接添加评论（不关联特定文本）的用户来说不够直观。

## 解决方案

在评论列表顶部添加了一个输入框，允许用户直接创建评论，无需选择文本。

### 修改内容

**文件**: `apps/client/src/features/comment/components/comment-list-with-tabs.tsx`

### 新增功能

1. **顶部输入框**
   - 在评论列表顶部添加评论编辑器
   - 只有有评论权限的用户才能看到
   - 使用与回复相同的编辑器组件

2. **状态管理**
   ```typescript
   const [newCommentContent, setNewCommentContent] = useState("");
   const [isCreatingComment, setIsCreatingComment] = useState(false);
   const newCommentEditorRef = useRef(null);
   const { ref: newCommentRef, focused: newCommentFocused } = useFocusWithin();
   ```

3. **创建评论处理**
   ```typescript
   const handleCreateNewComment = useCallback(async () => {
     if (!newCommentContent || !page?.id) return;
     
     try {
       setIsCreatingComment(true);
       const commentData = {
         pageId: page.id,
         content: JSON.stringify(newCommentContent),
       };
       
       await createCommentMutation.mutateAsync(commentData);
       setNewCommentContent("");
       newCommentEditorRef.current?.clearContent();
       
       emit({
         operation: "invalidateComment",
         pageId: page.id,
       });
     } catch (error) {
       console.error("Failed to create comment:", error);
     } finally {
       setIsCreatingComment(false);
     }
   }, [newCommentContent, page?.id, createCommentMutation, emit]);
   ```

4. **UI 布局**
   - 输入框显示在顶部
   - 只在获得焦点时显示保存/取消按钮
   - 自动调整滚动区域高度

### 用户体验改进

**之前**:
- 必须选择文本才能创建评论
- 不直观，用户可能不知道如何添加评论

**之后**:
- 打开评论面板就能看到输入框
- 可以直接输入评论，无需选择文本
- 更符合用户习惯

### 适用版本

- ✅ 开源版 (非企业版)
- ✅ 企业版/云版本

两个版本都添加了顶部输入框。

## 测试步骤

1. 打开任意页面
2. 点击右侧评论图标打开评论面板
3. 确认顶部显示输入框
4. 点击输入框，输入评论内容
5. 点击保存按钮
6. 确认评论成功创建并显示在列表中

## 相关文件

- `apps/client/src/features/comment/components/comment-list-with-tabs.tsx` - 主要修改文件

## 完成状态

✅ 已完成并测试

---

**修复日期**: 2025-11-18  
**修复者**: Kiro AI Assistant

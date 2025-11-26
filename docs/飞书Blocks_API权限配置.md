# 飞书 Blocks API 权限配置指南

## 问题现象

导入的飞书文档显示为纯文本，没有保留格式（标题、粗体、列表等）。

## 原因分析

飞书提供两种 API 获取文档内容：

1. **raw_content API** - 返回纯文本，不包含格式
2. **blocks API** - 返回结构化内容，包含完整格式

当前可能使用的是 raw_content API，需要确保 blocks API 可用。

## 解决方案

### 步骤 1：确认权限

访问飞书开放平台：https://open.feishu.cn/app/你的AppID/auth

确认已开通以下权限之一：
- ✅ **查看、评论和导出文档** (`docx:document:readonly`)
- ✅ **查看、评论、编辑和管理文档** (`docx:document`)

这两个权限都包含了 blocks API 的访问权限。

### 步骤 2：检查 API 端点

Blocks API 端点：
```
GET /open-apis/docx/v1/documents/{document_id}/blocks
```

需要的权限：
- `docx:document:readonly` 或
- `docx:document`

### 步骤 3：测试 Blocks API

使用 curl 测试：

```bash
# 1. 获取 access token
curl -X POST 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' \
  -H 'Content-Type: application/json' \
  -d '{
    "app_id": "你的App ID",
    "app_secret": "你的App Secret"
  }'

# 2. 测试 blocks API
curl -X GET 'https://open.feishu.cn/open-apis/docx/v1/documents/文档ID/blocks?page_size=500' \
  -H 'Authorization: Bearer 上一步获取的token'
```

**成功响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [
      {
        "block_id": "xxx",
        "block_type": 2,
        "text": {
          "elements": [...]
        }
      }
    ]
  }
}
```

**失败响应**：
```json
{
  "code": 99991672,
  "msg": "Access denied..."
}
```

### 步骤 4：检查文档类型

Blocks API 支持的文档类型：
- ✅ 新版文档（docx）
- ❌ 旧版文档（doc）- 不支持 blocks API

如果你的文档是旧版格式，需要：
1. 在飞书中打开文档
2. 点击"..."菜单
3. 选择"转换为新版文档"

### 步骤 5：查看后端日志

导入时查看后端日志：

```bash
# 成功使用 blocks API
[FeishuImportService] Got blocks data: {"items":[...]}
[FeishuImportService] Converting Feishu blocks to Tiptap

# 失败回退到 raw_content
[FeishuImportService] Failed to get document blocks: ...
[FeishuImportService] Using raw content fallback
```

## 支持的格式

使用 blocks API 后，可以保留以下格式：

### 文本格式
- ✅ 粗体 (bold)
- ✅ 斜体 (italic)
- ✅ 删除线 (strikethrough)
- ✅ 下划线 (underline)
- ✅ 行内代码 (inline code)
- ✅ 链接 (link)

### 块级元素
- ✅ 标题 (H1-H6)
- ✅ 段落 (paragraph)
- ✅ 有序列表 (ordered list)
- ✅ 无序列表 (bullet list)
- ✅ 代码块 (code block)
- ✅ 引用块 (blockquote)
- ✅ 分隔线 (horizontal rule)

### 暂不支持
- ❌ 图片（显示为文件名）
- ❌ 视频（显示为文件名）
- ❌ 表格
- ❌ 嵌入内容
- ❌ 附件

## 常见问题

### Q1: 为什么还是显示纯文本？

**A**: 可能的原因：
1. 文档是旧版格式 - 转换为新版文档
2. Blocks API 返回空数据 - 检查后端日志
3. 权限未生效 - 等待 5-10 分钟后重试
4. 文档内容确实是纯文本 - 在飞书中添加格式后重试

### Q2: 如何确认使用了 blocks API？

**A**: 查看后端日志：
- 看到 "Got blocks data" - 成功使用 blocks API
- 看到 "Failed to get document blocks" - 回退到 raw_content

### Q3: Blocks API 有什么限制？

**A**: 
- 每次最多返回 500 个 blocks
- 需要分页获取大文档
- 某些特殊内容可能不支持

### Q4: 如何处理图片和附件？

**A**: 图片和附件需要额外处理：
1. 从 blocks 中提取文件 token
2. 调用下载 API 获取文件
3. 上传到 NoteDoc 存储
4. 替换为 NoteDoc 的附件链接

这个功能较复杂，建议作为后续优化。

## 调试步骤

1. **确认权限**
   ```bash
   # 访问权限页面
   https://open.feishu.cn/app/你的AppID/auth
   ```

2. **测试 API**
   ```bash
   # 使用 curl 测试 blocks API
   curl -X GET '...' -H 'Authorization: Bearer token'
   ```

3. **查看日志**
   ```bash
   # 在 NoteDoc 后端日志中搜索
   grep "blocks" logs/backend.log
   ```

4. **验证文档**
   ```bash
   # 确认文档是新版格式
   # URL 包含 /docx/ 而不是 /doc/
   ```

## 下一步优化

1. **图片支持** - 下载并上传图片
2. **表格支持** - 转换为 Tiptap 表格
3. **附件支持** - 处理文件附件
4. **增量同步** - 检测文档更新
5. **批量导入** - 支持文件夹导入

---

**更新时间**：2025-11-26  
**适用版本**：NoteDoc v1.0.0

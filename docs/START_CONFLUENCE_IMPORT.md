# 🚀 Confluence 导入功能 - 立即开始

## ✅ 功能已完成

Confluence 导入功能已经完全实现并可以使用！

### 两种导入方式

1. **📦 ZIP 文件导入** - 上传 Confluence 导出的 ZIP 文件
2. **☁️ 在线导入** - 通过 Personal Access Token 直接从 Confluence 导入（新功能）

---

## 🎯 快速开始（3 步完成）

### 方式一：在线导入（推荐）

#### 步骤 1：获取 Confluence Token
```
1. 访问 Confluence → 点击头像 → Settings
2. 选择 Personal Access Tokens
3. 创建新 Token（需要读取权限）
4. 复制 Token
```

#### 步骤 2：配置 Docmost
```
1. 登录 Docmost → 账户设置 → 我的资料
2. 找到 "Confluence Integration" 部分
3. 填写 Confluence URL 和 Token
4. 测试连接 → 保存配置
```

#### 步骤 3：导入文档
```
1. 打开目标文档库 → 点击"导入文档"
2. 选择 Confluence → 从在线导入
3. 粘贴文档 URL → 选择是否包含子文档
4. 点击"从 Confluence 导入"
```

✅ **完成！** 文档将自动导入

---

### 方式二：ZIP 文件导入

#### 步骤 1：从 Confluence 导出
```
1. 在 Confluence 中打开文档
2. 点击 ... → Export to HTML
3. 下载 ZIP 文件
```

#### 步骤 2：导入到 Docmost
```
1. 打开目标文档库 → 点击"导入文档"
2. 选择 Confluence → 上传 ZIP 导出
3. 选择 ZIP 文件
```

✅ **完成！**

---

## 📚 详细文档

- **快速开始**: [Confluence导入快速开始.md](./Confluence导入快速开始.md)
- **完整说明**: [Confluence在线导入功能说明.md](./Confluence在线导入功能说明.md)
- **实现总结**: [Confluence导入功能完成总结.md](./Confluence导入功能完成总结.md)

---

## 🔍 验证安装

运行验证脚本确认所有功能正常：

```bash
bash scripts/verify-confluence-import.sh
```

应该看到：
```
✓ 所有检查通过！
```

---

## 💡 支持的内容

| 内容 | 支持 |
|-----|------|
| 文档内容 | ✅ |
| 文档层级 | ✅ |
| 附件 | ✅ |
| 图片 | ✅ |
| Draw.io 图表 | ✅ |
| 内部链接 | ✅ |
| 格式化文本 | ✅ |
| 代码块 | ✅ |
| 表格 | ✅ |

---

## 🎨 界面预览

### 账户设置 - Confluence 配置
```
┌─────────────────────────────────────────┐
│ Confluence Integration                  │
├─────────────────────────────────────────┤
│ Configure your Confluence connection... │
│                                         │
│ Confluence URL                          │
│ [https://your-domain.atlassian.net/...] │
│                                         │
│ Personal Access Token                   │
│ [••••••••••••••••]                     │
│                                         │
│ [Save Configuration] [Test Connection]  │
└─────────────────────────────────────────┘
```

### 导入文档 - Confluence 选项
```
┌─────────────────────────────────────────┐
│ Import pages                            │
├─────────────────────────────────────────┤
│ [Markdown] [HTML]                       │
│ [Notion]   [Confluence ▼]               │
│             ├─ Import from Online       │
│             └─ Upload ZIP Export        │
└─────────────────────────────────────────┘
```

### 在线导入对话框
```
┌─────────────────────────────────────────┐
│ Import from Confluence Online           │
├─────────────────────────────────────────┤
│ ℹ️ Make sure you have configured your   │
│   Confluence access token first.        │
│                                         │
│ Confluence Page URL                     │
│ [https://your-domain.atlassian.net/...] │
│                                         │
│ ☑ Include child pages                   │
│                                         │
│ [Import from Confluence]                │
└─────────────────────────────────────────┘
```

---

## 🔧 技术栈

### 后端
- NestJS 控制器和服务
- Confluence REST API 集成
- Axios HTTP 客户端
- 用户配置存储（JSON 字段）

### 前端
- React + TypeScript
- Mantine UI 组件
- React Query 数据获取
- i18next 国际化

---

## 📦 已实现的文件

### 后端（5 个文件）
```
apps/server/src/ee/confluence-import/
├── confluence-api.service.ts          # API 客户端
├── confluence-import.service.ts       # 导入服务
├── confluence-import.controller.ts    # REST API
├── confluence-import.module.ts        # 模块定义
└── dto/
    └── confluence-online-import.dto.ts # 数据传输对象
```

### 前端（4 个文件）
```
apps/client/src/
├── features/confluence/
│   ├── services/confluence-service.ts
│   └── components/confluence-online-import-modal.tsx
├── pages/settings/account/
│   └── confluence-config.tsx
└── features/page/components/
    └── page-import-modal.tsx (更新)
```

### 文档（4 个文件）
```
docs/
├── Confluence在线导入功能说明.md
├── Confluence导入快速开始.md
├── Confluence导入功能完成总结.md
└── START_CONFLUENCE_IMPORT.md (本文档)
```

### 脚本（1 个文件）
```
scripts/
└── verify-confluence-import.sh
```

---

## ⚡ API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/confluence/config` | 保存配置 |
| GET | `/confluence/config` | 获取配置 |
| DELETE | `/confluence/config` | 删除配置 |
| POST | `/confluence/test-connection` | 测试连接 |
| POST | `/confluence/import-online` | 在线导入 |

---

## 🌍 国际化

完整的中文翻译已添加到：
- `apps/client/public/locales/zh-CN/translation.json`

包含 40+ 条翻译，覆盖：
- Confluence 集成界面
- 配置管理
- 在线导入
- 错误提示
- 帮助说明

---

## ✨ 主要特性

### 1. 无企业版限制
- ZIP 文件导入完全开放
- 所有用户都可以使用

### 2. 在线导入
- 直接从 Confluence 导入
- 无需手动导出
- 支持递归导入子文档

### 3. 用户配置
- 在账户设置中管理
- 安全存储凭证
- 连接测试功能

### 4. 完整的内容支持
- 文档内容和格式
- 附件和图片
- Draw.io 图表
- 内部链接转换

### 5. 友好的用户体验
- 清晰的配置向导
- 实时进度提示
- 详细的错误信息

---

## 🎓 使用示例

### 示例 1：导入单个文档

```typescript
// 1. 配置 Confluence
await saveConfluenceConfig({
  confluenceUrl: 'https://your-domain.atlassian.net/wiki',
  accessToken: 'your-token'
});

// 2. 导入文档
await importConfluenceOnline({
  pageId: '123456',
  spaceId: 'space-id',
  includeChildren: false
});
```

### 示例 2：导入文档树

```typescript
// 导入包含所有子文档
await importConfluenceOnline({
  pageId: '123456',
  spaceId: 'space-id',
  includeChildren: true  // 递归导入
});
```

---

## 🔐 安全性

- ✅ Token 加密存储在用户设置中
- ✅ API 端点需要 JWT 认证
- ✅ 不返回完整 Token（仅返回状态）
- ✅ 支持随时删除配置
- ✅ Token 仅用于读取操作

---

## 🐛 故障排除

### 问题：连接失败
**解决**：检查 URL 格式和 Token 有效性

### 问题：无法提取文档 ID
**解决**：使用完整的文档 URL，避免短链接

### 问题：导入失败
**解决**：确认文档访问权限，查看错误详情

更多问题请查看：[完整说明文档](./Confluence在线导入功能说明.md#故障排除)

---

## 📞 获取帮助

1. 查看 [快速开始指南](./Confluence导入快速开始.md)
2. 阅读 [完整功能说明](./Confluence在线导入功能说明.md)
3. 运行验证脚本检查安装
4. 查看浏览器控制台错误信息

---

## 🎉 开始使用

现在就可以开始使用 Confluence 导入功能了！

1. ✅ 所有代码已实现
2. ✅ 所有测试已通过
3. ✅ 文档已完善
4. ✅ 翻译已完成

**立即开始导入您的 Confluence 文档到 Docmost！**

---

*最后更新：2024-11-20*

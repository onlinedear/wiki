# Confluence 统一配置说明

## 概述

Confluence 导入功能已更新为统一配置模式。用户必须先在个人资料设置中配置 Confluence 连接信息，然后才能使用导入功能。

## 主要改动

### 前端改动

1. **导入模态框** (`confluence-online-import-modal.tsx`)
   - 移除了 Confluence URL 和访问令牌输入字段
   - 添加配置检查逻辑
   - 未配置时显示提示并引导用户到设置页面
   - 已配置时只需输入页面 URL 即可导入

2. **配置页面** (`confluence-config.tsx`)
   - 集成到个人资料设置中
   - 提供保存、测试和删除配置功能
   - 显示配置状态

### 后端改动

1. **控制器** (`confluence-import.controller.ts`)
   - 导入接口强制使用保存的配置
   - 未配置时返回明确的错误提示
   - 不再接受临时的 URL 和令牌参数

2. **DTO** (`confluence-online-import.dto.ts`)
   - `ConfluenceOnlineImportDto` 移除了 `confluenceUrl` 和 `accessToken` 字段
   - 保留 `SaveConfluenceConfigDto` 用于配置管理接口

3. **服务** (`confluence-import.service.ts`)
   - 配置保存在用户的 `settings` 字段中
   - 提供配置的增删改查方法

## 使用流程

### 1. 配置 Confluence 连接

1. 进入 **设置 → 我的资料**
2. 找到 **Confluence 集成** 部分
3. 输入 Confluence URL（例如：`https://your-domain.atlassian.net/wiki`）
4. 输入个人访问令牌
5. 点击 **测试连接** 验证配置
6. 点击 **保存配置**

### 2. 导入 Confluence 页面

1. 在文档库中点击导入按钮
2. 选择 **从 Confluence 在线导入**
3. 输入要导入的 Confluence 页面 URL
4. 选择是否包含子页面
5. 点击 **从 Confluence 导入**

## 优势

1. **更安全**：凭证集中管理，不需要每次导入都输入
2. **更便捷**：配置一次，多次使用
3. **更清晰**：配置和使用分离，界面更简洁

## 验证

运行验证脚本检查实现：

```bash
./scripts/verify-confluence-unified-config.sh
```

## 技术细节

### 配置存储

配置保存在 `users` 表的 `settings` JSON 字段中：

```json
{
  "confluence": {
    "confluenceUrl": "https://example.atlassian.net/wiki",
    "accessToken": "encrypted-token"
  }
}
```

### API 端点

- `POST /api/confluence/config` - 保存配置
- `GET /api/confluence/config` - 获取配置（不返回完整令牌）
- `DELETE /api/confluence/config` - 删除配置
- `POST /api/confluence/test-connection` - 测试连接
- `POST /api/confluence/import-online` - 导入页面（使用保存的配置）

## 注意事项

1. 访问令牌不会在 GET 请求中返回完整内容，只返回是否已配置的标志
2. 每次保存配置时会自动测试连接
3. 删除配置后需要重新配置才能使用导入功能

# Confluence 配置保存问题排查指南

## 问题描述

在个人资料中配置了 Confluence URL 和个人访问令牌，点击保存后，刷新页面配置没有保存成功。

## 可能的原因

### 1. 连接测试失败

后端在保存配置前会先测试 Confluence 连接。如果测试失败，配置不会被保存。

**检查方法：**
- 打开浏览器开发者工具 (F12)
- 切换到 Console 标签
- 点击保存配置
- 查看是否有错误信息：`Save config error:`

**常见原因：**
- Confluence URL 格式不正确（应该是 `https://your-domain.atlassian.net/wiki`）
- Personal Access Token 无效或已过期
- 网络无法访问 Confluence 实例
- Confluence 实例需要 VPN 或特殊网络配置

### 2. 后端服务未运行

**检查方法：**
```bash
curl http://localhost:3000/api/health
```

如果返回错误，说明后端服务未运行。

**解决方法：**
```bash
pnpm server:dev
```

### 3. 数据库连接问题

**检查方法：**
查看后端日志中是否有数据库错误。

### 4. JWT 认证问题

**检查方法：**
- 打开浏览器开发者工具 (F12)
- 切换到 Network 标签
- 点击保存配置
- 查看 `/api/confluence/config` 请求
- 如果返回 401，说明认证失败

## 排查步骤

### 步骤 1: 运行调试脚本

```bash
bash scripts/debug-confluence-config.sh
```

这会检查：
- 后端服务状态
- 模块注册情况
- 数据库结构
- API 路由配置

### 步骤 2: 检查浏览器网络请求

1. 打开浏览器开发者工具 (F12)
2. 切换到 Network (网络) 标签
3. 清空现有请求
4. 在个人资料页面填写 Confluence 配置
5. 点击"保存配置"按钮
6. 查看网络请求：

**期望的请求：**
```
POST /api/confluence/config
Status: 200 OK
Response: {
  "success": true,
  "message": "Confluence configuration saved successfully"
}
```

**如果请求失败：**
- 状态码 400: 请求参数错误（URL 格式不正确等）
- 状态码 401: 未登录或 token 过期
- 状态码 500: 服务器内部错误（查看后端日志）

### 步骤 3: 检查浏览器控制台

1. 切换到 Console (控制台) 标签
2. 查看日志输出：

**成功的日志：**
```
Save config result: { success: true, message: "..." }
```

**失败的日志：**
```
Save config error: { response: { data: { message: "..." } } }
```

### 步骤 4: 检查后端日志

在运行 `pnpm server:dev` 的终端中查看日志：

**成功的日志：**
```
[ConfluenceImportController] Saving Confluence config for user xxx
[ConfluenceImportController] Confluence URL: https://...
[ConfluenceImportController] Confluence connection test passed
[ConfluenceImportService] Saving Confluence config for user xxx
[ConfluenceImportService] Confluence config saved successfully. Rows affected: 1
[ConfluenceImportController] Confluence configuration saved successfully
```

**失败的日志：**
```
[ConfluenceImportController] Error testing Confluence connection: ...
```
或
```
[ConfluenceImportService] Error saving Confluence configuration: ...
```

### 步骤 5: 验证配置是否保存

刷新页面后，检查配置是否加载：

1. 打开 Network 标签
2. 刷新页面
3. 查看 `GET /api/confluence/config` 请求

**期望的响应：**
```json
{
  "confluenceUrl": "https://your-domain.atlassian.net/wiki",
  "hasAccessToken": true
}
```

如果 `confluenceUrl` 为 `null` 或 `hasAccessToken` 为 `false`，说明配置没有保存成功。

## 解决方案

### 方案 1: 跳过连接测试（临时）

如果你确定配置是正确的，但连接测试一直失败（例如需要 VPN），可以临时跳过连接测试：

修改 `apps/server/src/ee/confluence-import/confluence-import.controller.ts`：

```typescript
@Post('config')
async saveConfig(
  @Body() dto: SaveConfluenceConfigDto,
  @AuthUser() user: User,
) {
  const userId = user.id;

  // 注释掉连接测试
  // const isValid = await this.confluenceApiService.testConnection(...);
  // if (!isValid) { ... }

  await this.confluenceImportService.saveUserConfluenceConfig(userId, {
    confluenceUrl: dto.confluenceUrl,
    accessToken: dto.accessToken,
  });

  return { success: true, message: 'Confluence configuration saved successfully' };
}
```

### 方案 2: 使用"测试连接"按钮

在保存配置前，先点击"测试连接"按钮，确保连接成功后再保存。

### 方案 3: 检查 Confluence URL 格式

确保 URL 格式正确：

**正确的格式：**
- `https://your-domain.atlassian.net/wiki`
- `https://confluence.your-company.com`

**错误的格式：**
- `https://your-domain.atlassian.net/wiki/` (末尾有斜杠)
- `https://your-domain.atlassian.net` (缺少 /wiki)
- `http://...` (使用 http 而不是 https)

### 方案 4: 验证 Personal Access Token

1. 登录到你的 Confluence 实例
2. 进入 Settings → Personal Access Tokens
3. 确认 token 是否有效
4. 确认 token 有读取权限
5. 如果 token 过期，创建新的 token

## 手动测试 API

如果需要手动测试 API，可以使用以下 curl 命令：

### 1. 获取 JWT Token

在浏览器开发者工具中：
1. 打开 Application 标签
2. 展开 Cookies
3. 找到你的域名
4. 复制 `access_token` 或类似名称的 cookie 值

### 2. 测试保存配置

```bash
curl -X POST http://localhost:3000/api/confluence/config \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "confluenceUrl": "https://your-domain.atlassian.net/wiki",
    "accessToken": "your-confluence-token"
  }'
```

### 3. 测试获取配置

```bash
curl -X GET http://localhost:3000/api/confluence/config \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### 4. 测试连接

```bash
curl -X POST http://localhost:3000/api/confluence/test-connection \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "confluenceUrl": "https://your-domain.atlassian.net/wiki",
    "accessToken": "your-confluence-token"
  }'
```

## 代码改进

我已经对代码进行了以下改进：

### 1. 添加详细日志

- 后端控制器和服务现在会输出详细的日志
- 可以在后端日志中看到保存过程的每一步

### 2. 改进错误处理

- 前端现在会在控制台输出保存结果和错误信息
- 保存成功后会重新加载配置以验证

### 3. 更好的错误提示

- 如果连接测试失败，会显示具体的错误信息
- 如果保存失败，会显示具体的错误原因

## 下一步

1. 重启后端服务：`pnpm server:dev`
2. 刷新前端页面
3. 按照上述步骤重新测试
4. 查看浏览器控制台和后端日志
5. 根据错误信息进行相应的处理

如果问题仍然存在，请提供：
- 浏览器控制台的完整错误信息
- 后端日志的相关输出
- 网络请求的详细信息（状态码、响应内容）

# Confluence 在线导入功能说明

## 功能概述

现在 Docmost 支持两种方式从 Confluence 导入文档：

1. **ZIP 文件导入**：上传 Confluence 导出的 ZIP 文件
2. **在线导入**（新功能）：通过 Personal Access Token 直接从 Confluence 在线实例导入文档

## 配置步骤

### 1. 获取 Confluence Personal Access Token

1. 登录到您的 Confluence 实例
2. 点击右上角的头像 → **Settings**（设置）
3. 在左侧菜单中选择 **Personal Access Tokens**（个人访问令牌）
4. 点击 **Create token**（创建令牌）
5. 输入令牌名称（例如：Docmost Import）
6. 设置过期时间（建议选择较长的时间或不过期）
7. 点击 **Create**（创建）
8. **重要**：立即复制生成的令牌，您将无法再次查看它

参考文档：https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html

### 2. 在 Docmost 中配置 Confluence

1. 登录 Docmost
2. 进入 **账户设置** → **我的资料**
3. 滚动到 **Confluence Integration**（Confluence 集成）部分
4. 填写以下信息：
   - **Confluence URL**：您的 Confluence 实例地址（例如：`https://your-domain.atlassian.net/wiki`）
   - **Personal Access Token**：刚才复制的令牌
5. 点击 **Test Connection**（测试连接）验证配置是否正确
6. 点击 **Save Configuration**（保存配置）

## 使用方法

### 在线导入文档

1. 在 Docmost 中打开要导入文档的文档库
2. 点击 **导入文档** 按钮
3. 选择 **Confluence** → **从在线导入**
4. 在弹出的对话框中：
   - 粘贴要导入的 Confluence 文档 URL
   - 选择是否包含子文档（递归导入）
5. 点击 **从 Confluence 导入**

### 支持的 URL 格式

- `https://your-domain.atlassian.net/wiki/pages/123456/Page+Title`
- `https://your-domain.atlassian.net/wiki/pages/viewpage.action?pageId=123456`

### ZIP 文件导入

如果您更喜欢使用传统的 ZIP 导出方式：

1. 在 Confluence 中导出文档为 HTML 格式
2. 在 Docmost 中点击 **导入文档**
3. 选择 **Confluence** → **上传 ZIP 导出**
4. 选择导出的 ZIP 文件

## 功能特性

### 支持的内容

- ✅ 文档标题和内容
- ✅ 文档层级结构（父子关系）
- ✅ 附件（图片、文件等）
- ✅ Draw.io 图表
- ✅ 内部链接（转换为文档引用）
- ✅ 格式化文本（标题、列表、表格等）
- ✅ 代码块
- ✅ 嵌入内容

### 导入选项

- **包含子文档**：递归导入所有子文档，保持原有的文档结构
- **单个文档**：仅导入指定的文档

## 安全说明

- Personal Access Token 加密存储在您的用户设置中
- Token 仅用于从 Confluence 读取数据
- 您可以随时在账户设置中删除配置
- 建议为 Token 设置适当的权限（仅需读取权限）

## 故障排除

### 连接失败

- 检查 Confluence URL 是否正确
- 确认 Token 是否有效且未过期
- 验证 Token 是否有读取权限
- 检查网络连接

### 导入失败

- 确认您有权限访问要导入的文档
- 检查文档 URL 是否正确
- 尝试先导入单个文档，不包含子文档
- 查看错误消息获取详细信息

### 无法提取文档 ID

- 确保使用的是直接的文档 URL
- 避免使用短链接或重定向 URL
- 从浏览器地址栏复制完整的 URL

## 技术实现

### 后端

- **Confluence API 客户端**：使用 Confluence REST API 获取文档内容
- **在线导入服务**：处理文档下载、转换和保存
- **附件处理**：自动下载并存储附件
- **用户配置管理**：安全存储用户的 Confluence 凭证

### 前端

- **配置界面**：在账户设置中管理 Confluence 连接
- **导入界面**：支持 ZIP 和在线两种导入方式
- **进度提示**：实时显示导入状态

## API 端点

- `POST /confluence/config` - 保存 Confluence 配置
- `GET /confluence/config` - 获取 Confluence 配置
- `DELETE /confluence/config` - 删除 Confluence 配置
- `POST /confluence/test-connection` - 测试连接
- `POST /confluence/import-online` - 在线导入文档

## 注意事项

1. 首次使用需要先在账户设置中配置 Confluence 连接
2. Token 需要有读取权限才能导入文档
3. 大量文档导入可能需要较长时间，请耐心等待
4. 导入过程中请不要关闭浏览器标签页
5. 建议先测试导入单个文档，确认效果后再批量导入

## 更新日志

### 2024-11-20

- ✅ 实现 Confluence Personal Access Token 配置
- ✅ 实现在线导入功能
- ✅ 支持递归导入子文档
- ✅ 自动下载和处理附件
- ✅ 添加连接测试功能
- ✅ 移除 Confluence 导入的企业版限制

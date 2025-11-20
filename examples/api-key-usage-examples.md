# API Key 使用示例

本文档提供了使用 Docmost API Key 的各种示例代码。

## 目录
- [JavaScript/Node.js](#javascriptnodejs)
- [Python](#python)
- [cURL](#curl)
- [Postman](#postman)
- [常见场景](#常见场景)

---

## JavaScript/Node.js

### 基础使用

```javascript
// 使用 fetch API
const API_KEY = 'dk_your_api_key_here';
const WORKSPACE_ID = 'your-workspace-id';
const BASE_URL = 'http://localhost:3000/api';

async function getApiKeys() {
  const response = await fetch(
    `${BASE_URL}/workspaces/${WORKSPACE_ID}/api-keys`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// 使用
getApiKeys()
  .then(keys => console.log('API Keys:', keys))
  .catch(error => console.error('Error:', error));
```

### 创建 API Key

```javascript
async function createApiKey(name, description, scopes, expiresAt) {
  const response = await fetch(
    `${BASE_URL}/workspaces/${WORKSPACE_ID}/api-keys`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        scopes,
        expiresAt
      })
    }
  );
  
  const data = await response.json();
  
  // 重要：保存返回的 token，这是唯一一次可以看到它
  console.log('New API Key Token:', data.token);
  console.log('请妥善保存此 token！');
  
  return data;
}

// 使用示例
createApiKey(
  'My Automation Key',
  '用于自动化脚本',
  ['pages:read', 'pages:write'],
  '2025-12-31T23:59:59Z'
);
```

### 使用 axios

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});

// 获取所有 API Keys
async function getAllKeys() {
  try {
    const response = await client.get(`/workspaces/${WORKSPACE_ID}/api-keys`);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// 更新 API Key
async function updateApiKey(keyId, updates) {
  try {
    const response = await client.put(
      `/workspaces/${WORKSPACE_ID}/api-keys/${keyId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// 删除 API Key
async function deleteApiKey(keyId) {
  try {
    await client.delete(`/workspaces/${WORKSPACE_ID}/api-keys/${keyId}`);
    console.log('API Key deleted successfully');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}
```

---

## Python

### 基础使用

```python
import requests
import json
from datetime import datetime, timedelta

API_KEY = 'dk_your_api_key_here'
WORKSPACE_ID = 'your-workspace-id'
BASE_URL = 'http://localhost:3000/api'

class DocmostAPIClient:
    def __init__(self, api_key, workspace_id, base_url=BASE_URL):
        self.api_key = api_key
        self.workspace_id = workspace_id
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_api_keys(self):
        """获取所有 API Keys"""
        url = f'{self.base_url}/workspaces/{self.workspace_id}/api-keys'
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def create_api_key(self, name, description, scopes, expires_at=None):
        """创建新的 API Key"""
        url = f'{self.base_url}/workspaces/{self.workspace_id}/api-keys'
        
        data = {
            'name': name,
            'description': description,
            'scopes': scopes
        }
        
        if expires_at:
            data['expiresAt'] = expires_at
        
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        print(f"新 API Key Token: {result['token']}")
        print("请妥善保存此 token！")
        
        return result
    
    def update_api_key(self, key_id, **updates):
        """更新 API Key"""
        url = f'{self.base_url}/workspaces/{self.workspace_id}/api-keys/{key_id}'
        response = requests.put(url, headers=self.headers, json=updates)
        response.raise_for_status()
        return response.json()
    
    def delete_api_key(self, key_id):
        """删除 API Key"""
        url = f'{self.base_url}/workspaces/{self.workspace_id}/api-keys/{key_id}'
        response = requests.delete(url, headers=self.headers)
        response.raise_for_status()
        return True
    
    def get_stats(self):
        """获取统计信息"""
        url = f'{self.base_url}/workspaces/{self.workspace_id}/api-keys/stats'
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

# 使用示例
if __name__ == '__main__':
    client = DocmostAPIClient(API_KEY, WORKSPACE_ID)
    
    # 获取所有 API Keys
    keys = client.get_api_keys()
    print(f"找到 {len(keys)} 个 API Keys")
    
    # 创建新的 API Key（30天后过期）
    expires_at = (datetime.now() + timedelta(days=30)).isoformat()
    new_key = client.create_api_key(
        name='Python Script Key',
        description='用于 Python 自动化脚本',
        scopes=['pages:read', 'pages:write'],
        expires_at=expires_at
    )
    
    # 获取统计信息
    stats = client.get_stats()
    print(f"统计信息: {stats}")
```

### 使用 requests Session

```python
import requests

class DocmostSession:
    def __init__(self, api_key, workspace_id):
        self.workspace_id = workspace_id
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
        self.base_url = 'http://localhost:3000/api'
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.session.close()
    
    def get(self, endpoint):
        url = f'{self.base_url}/workspaces/{self.workspace_id}/{endpoint}'
        return self.session.get(url).json()
    
    def post(self, endpoint, data):
        url = f'{self.base_url}/workspaces/{self.workspace_id}/{endpoint}'
        return self.session.post(url, json=data).json()

# 使用
with DocmostSession(API_KEY, WORKSPACE_ID) as client:
    keys = client.get('api-keys')
    print(keys)
```

---

## cURL

### 获取所有 API Keys

```bash
curl -X GET \
  "http://localhost:3000/api/workspaces/your-workspace-id/api-keys" \
  -H "Authorization: Bearer dk_your_api_key_here" \
  -H "Content-Type: application/json"
```

### 创建 API Key

```bash
curl -X POST \
  "http://localhost:3000/api/workspaces/your-workspace-id/api-keys" \
  -H "Authorization: Bearer dk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "description": "用于测试",
    "scopes": ["pages:read", "pages:write"],
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

### 获取统计信息

```bash
curl -X GET \
  "http://localhost:3000/api/workspaces/your-workspace-id/api-keys/stats" \
  -H "Authorization: Bearer dk_your_api_key_here"
```

### 更新 API Key

```bash
curl -X PUT \
  "http://localhost:3000/api/workspaces/your-workspace-id/api-keys/key-id" \
  -H "Authorization: Bearer dk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "inactive"
  }'
```

### 删除 API Key

```bash
curl -X DELETE \
  "http://localhost:3000/api/workspaces/your-workspace-id/api-keys/key-id" \
  -H "Authorization: Bearer dk_your_api_key_here"
```

### 使用 X-API-Key Header

```bash
curl -X GET \
  "http://localhost:3000/api/workspaces/your-workspace-id/api-keys" \
  -H "X-API-Key: dk_your_api_key_here"
```

---

## Postman

### 环境变量设置

创建一个 Postman 环境，包含以下变量：

```json
{
  "base_url": "http://localhost:3000/api",
  "workspace_id": "your-workspace-id",
  "api_key": "dk_your_api_key_here"
}
```

### 请求配置

**Headers:**
```
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

**GET 请求示例:**
```
GET {{base_url}}/workspaces/{{workspace_id}}/api-keys
```

**POST 请求示例:**
```
POST {{base_url}}/workspaces/{{workspace_id}}/api-keys

Body (JSON):
{
  "name": "Postman Test Key",
  "description": "Created from Postman",
  "scopes": ["pages:read"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

## 常见场景

### 1. 自动化备份脚本

```javascript
// backup-pages.js
const fs = require('fs');
const axios = require('axios');

const client = axios.create({
  baseURL: process.env.DOCMOST_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.DOCMOST_API_KEY}`
  }
});

async function backupAllPages() {
  try {
    // 获取所有页面
    const response = await client.get('/pages');
    const pages = response.data;
    
    // 保存到文件
    const backup = {
      timestamp: new Date().toISOString(),
      pages: pages
    };
    
    fs.writeFileSync(
      `backup-${Date.now()}.json`,
      JSON.stringify(backup, null, 2)
    );
    
    console.log(`备份完成: ${pages.length} 个页面`);
  } catch (error) {
    console.error('备份失败:', error.message);
  }
}

backupAllPages();
```

### 2. 批量导入内容

```python
# import_content.py
import json
from docmost_client import DocmostAPIClient

def import_pages_from_json(client, json_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for page in data['pages']:
        try:
            client.create_page(
                title=page['title'],
                content=page['content'],
                space_id=page['space_id']
            )
            print(f"导入成功: {page['title']}")
        except Exception as e:
            print(f"导入失败 {page['title']}: {e}")

if __name__ == '__main__':
    client = DocmostAPIClient(
        api_key=os.getenv('DOCMOST_API_KEY'),
        workspace_id=os.getenv('WORKSPACE_ID')
    )
    
    import_pages_from_json(client, 'pages.json')
```

### 3. 监控和告警

```javascript
// monitor.js
const axios = require('axios');
const nodemailer = require('nodemailer');

async function checkApiKeyExpiration() {
  const client = axios.create({
    baseURL: process.env.DOCMOST_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.DOCMOST_API_KEY}`
    }
  });
  
  const response = await client.get('/api-keys');
  const keys = response.data;
  
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const expiringKeys = keys.filter(key => {
    if (!key.expiresAt) return false;
    const expiresAt = new Date(key.expiresAt);
    return expiresAt <= sevenDaysLater && expiresAt > now;
  });
  
  if (expiringKeys.length > 0) {
    await sendAlert(expiringKeys);
  }
}

async function sendAlert(keys) {
  // 发送邮件告警
  console.log(`警告: ${keys.length} 个 API Key 即将过期`);
  keys.forEach(key => {
    console.log(`- ${key.name}: ${key.expiresAt}`);
  });
}

// 每天运行一次
setInterval(checkApiKeyExpiration, 24 * 60 * 60 * 1000);
```

### 4. CI/CD 集成

```yaml
# .github/workflows/deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Docmost
        env:
          DOCMOST_API_KEY: ${{ secrets.DOCMOST_API_KEY }}
          WORKSPACE_ID: ${{ secrets.WORKSPACE_ID }}
        run: |
          curl -X POST \
            "https://api.docmost.com/workspaces/$WORKSPACE_ID/pages" \
            -H "Authorization: Bearer $DOCMOST_API_KEY" \
            -H "Content-Type: application/json" \
            -d @docs/content.json
```

---

## 错误处理

### JavaScript

```javascript
async function safeApiCall(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.response) {
      // 服务器返回错误
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求发送但没有响应
      console.error('No response received');
    } else {
      // 其他错误
      console.error('Error:', error.message);
    }
    throw error;
  }
}
```

### Python

```python
def safe_api_call(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e.response.status_code}")
            print(f"Response: {e.response.text}")
        except requests.exceptions.ConnectionError:
            print("连接错误: 无法连接到服务器")
        except requests.exceptions.Timeout:
            print("请求超时")
        except Exception as e:
            print(f"未知错误: {str(e)}")
    return wrapper
```

---

## 最佳实践

1. **环境变量**: 始终使用环境变量存储 API Key
2. **错误处理**: 实现完善的错误处理逻辑
3. **重试机制**: 对于网络错误实现重试
4. **日志记录**: 记录所有 API 调用
5. **速率限制**: 注意 API 调用频率
6. **Token 安全**: 永远不要在代码中硬编码 API Key
7. **定期轮换**: 定期更新 API Key
8. **最小权限**: 只授予必要的权限范围

---

## 更多资源

- [API 文档](../apps/server/src/ee/api-key/README.md)
- [快速启动指南](../API_KEY_QUICKSTART.md)
- [功能说明](../API_MANAGEMENT_FEATURES.md)

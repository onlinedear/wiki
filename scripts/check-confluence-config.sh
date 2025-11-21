#!/bin/bash

# 检查 Confluence 配置是否保存到数据库

echo "检查用户的 Confluence 配置..."
echo ""

# 从 .env 文件读取数据库连接
source .env

# 查询用户的 settings 字段
psql "$DATABASE_URL" -c "
SELECT 
  id,
  name,
  email,
  settings->'confluence' as confluence_config,
  settings
FROM users
ORDER BY created_at DESC
LIMIT 5;
"

echo ""
echo "如果 confluence_config 列为空，说明配置没有保存成功"

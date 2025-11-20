-- API Keys 表迁移 SQL
-- 可以手动执行此文件来创建 API Keys 功能所需的数据库结构

-- ============================================
-- 步骤 1: 创建基础表（如果不存在）
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_uuid_v7(),
  name TEXT,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 步骤 2: 添加扩展字段
-- ============================================

-- 添加 token 字段（哈希后的 API Key）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'token'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN token TEXT NOT NULL UNIQUE;
  END IF;
END $$;

-- 添加 scopes 字段（权限范围）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'scopes'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN scopes JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 添加 status 字段（状态）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'status'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- 添加 description 字段（描述）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'description'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN description TEXT;
  END IF;
END $$;

-- 添加 last_used_ip 字段（最后使用 IP）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'last_used_ip'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN last_used_ip TEXT;
  END IF;
END $$;

-- 添加 usage_count 字段（使用次数）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN usage_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 步骤 3: 创建索引
-- ============================================

-- token 索引（用于快速查找）
CREATE INDEX IF NOT EXISTS api_keys_token_idx ON api_keys(token);

-- workspace_id 索引（用于查询工作空间的所有 API Keys）
CREATE INDEX IF NOT EXISTS api_keys_workspace_id_idx ON api_keys(workspace_id);

-- status 索引（用于过滤活跃/非活跃的 API Keys）
CREATE INDEX IF NOT EXISTS api_keys_status_idx ON api_keys(status);

-- ============================================
-- 步骤 4: 验证表结构
-- ============================================

-- 查看表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'api_keys'
ORDER BY ordinal_position;

-- 查看索引
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'api_keys';

-- ============================================
-- 完成！
-- ============================================

-- 现在可以使用 API Keys 功能了
-- 表名: api_keys
-- 
-- 字段说明:
-- - id: UUID 主键
-- - name: API Key 名称
-- - description: 描述信息
-- - token: 哈希后的 token（SHA-256）
-- - scopes: 权限范围（JSONB 数组）
-- - status: 状态（active/inactive）
-- - creator_id: 创建者用户 ID
-- - workspace_id: 所属工作空间 ID
-- - expires_at: 过期时间
-- - last_used_at: 最后使用时间
-- - last_used_ip: 最后使用 IP 地址
-- - usage_count: 使用次数
-- - created_at: 创建时间
-- - updated_at: 更新时间
-- - deleted_at: 删除时间（软删除）

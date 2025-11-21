-- 更新所有附件的 tsv 字段
-- 此脚本用于修复现有附件的全文搜索索引

-- 更新所有 tsv 为 NULL 的附件
UPDATE attachments 
SET tsv = 
    setweight(to_tsvector('english', f_unaccent(coalesce(file_name, ''))), 'A') ||
    setweight(to_tsvector('english', f_unaccent(coalesce(text_content, ''))), 'B')
WHERE tsv IS NULL;

-- 查看更新结果
SELECT 
    COUNT(*) as total_attachments,
    COUNT(tsv) as attachments_with_tsv,
    COUNT(*) - COUNT(tsv) as attachments_without_tsv
FROM attachments;

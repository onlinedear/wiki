# PandaWiki 文档树结构导入机制深度分析

## 一、核心概念

### 1.1 文档树结构

PandaWiki 的文档组织采用**树形结构**：

```
知识库根目录
├── 文件夹A
│   ├── 文档1.md
│   ├── 文档2.md
│   └── 子文件夹B
│       ├── 文档3.md
│       └── 文档4.md
├── 文件夹C
│   └── 文档5.md
└── 文档6.md
```

### 1.2 关键数据结构

#### 前端数据结构

```typescript
interface ListDataItem {
  uuid: string;              // 前端唯一标识
  platform_id: string;       // 平台ID（如飞书的知识库ID）
  id: string;                // 文档/文件夹ID
  parent_id: string;         // 父节点ID
  title: string;             // 标题
  summary: string;           // 摘要/错误信息
  file: boolean;             // true=文件, false=文件夹
  file_type?: string;        // 文件类型
  status: string;            // 状态
  open: boolean;             // 是否展开（文件夹）
  folderReq?: boolean;       // 文件夹是否已拉取子文档
  feishu_setting?: {...};    // 飞书配置（用于拉取子文档）
  space_id?: string;         // 空间ID
  task_id?: string;          // 导出任务ID
  progress?: number;         // 进度
}
```


#### 后端数据结构

```go
// 节点创建请求
type CreateNodeReq struct {
    Name      string  `json:"name"`       // 节点名称
    Content   string  `json:"content"`    // 内容
    ParentID  *string `json:"parent_id"`  // 父节点ID
    Type      int     `json:"type"`       // 1=文件夹, 2=文件
    KbID      string  `json:"kb_id"`      // 知识库ID
}
```

#### Anydoc 树形结构

```typescript
interface AnydocChild {
  value?: AnydocValue;
  children?: AnydocChild[];  // 递归子节点
}

interface AnydocValue {
  id?: string;
  title?: string;
  summary?: string;
  file?: boolean;
  file_type?: string;
}
```

---

## 二、导入流程概览

### 2.1 完整流程图

```
[1] 用户发起导入
    ↓
[2] 获取文档列表（树形结构）
    ↓
[3] 平铺树形结构为列表
    ↓
[4] 用户选择要导入的文档
    ↓
[5] 按顺序导入（先父后子）
    ↓
[6] 维护 parent_id 映射关系
    ↓
[7] 完成导入
```

---

## 三、树形结构平铺算法

### 3.1 核心函数：flattenCrawlerParseResponse

**文件**: `web/admin/src/pages/document/component/AddDocByType/util.ts`

```typescript
export const flattenCrawlerParseResponse = (
  response: V1CrawlerParseResp,
  parentId: string | null = null,
  extraFields: Partial<ListDataItem> = {},
): ListDataItem[] => {
  const result: ListDataItem[] = [];
  const platformId = response.id || '';

  // 递归处理单个节点
  const processNode = (
    node: AnydocChild | undefined,
    currentParentId: string | null,
  ) => {
    if (!node || !node.value) {
      return;
    }

    const { value, children } = node;

    // 跳过无效节点
    if (!value.id) {
      if (children && children.length > 0) {
        children.forEach(child => processNode(child, currentParentId));
      }
      return;
    }

    // 创建 ListDataItem
    const item: ListDataItem = {
      uuid: uuidv4(),
      platform_id: platformId,
      id: value.id,
      title: value.title || '',
      summary: value.summary || '',
      file_type: value.file_type,
      file: value.file ?? false,
      parent_id: currentParentId || '',
      open: !value.file,  // 文件夹默认展开
      status: 'parsed',
      folderReq: true,
      ...extraFields,
    };

    result.push(item);

    // 递归处理子节点，使用当前节点的 id 作为 parent_id
    if (children && children.length > 0) {
      children.forEach(child => processNode(child, value.id!));
    }
  };

  // 从根节点开始处理
  if (response.docs) {
    processNode(response.docs, parentId);
  }

  return result;
};
```

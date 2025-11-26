export interface FeishuDocument {
  token: string;
  name: string;
  type: 'docx' | 'folder';
  parent_token: string | null;
  created_time?: string;
  modified_time?: string;
}

export interface DocumentTreeNode {
  token: string;
  name: string;
  type: 'docx' | 'folder';
  parentToken: string | null;
  children: DocumentTreeNode[];
  checked: boolean;
  indeterminate: boolean;
  expanded: boolean;
}

export function buildDocumentTree(documents: FeishuDocument[]): DocumentTreeNode[] {
  const nodeMap = new Map<string, DocumentTreeNode>();
  
  // Create all nodes
  for (const doc of documents) {
    nodeMap.set(doc.token, {
      token: doc.token,
      name: doc.name,
      type: doc.type,
      parentToken: doc.parent_token,
      children: [],
      checked: false,
      indeterminate: false,
      expanded: doc.type === 'folder',
    });
  }
  
  // Build tree structure
  const roots: DocumentTreeNode[] = [];
  
  for (const node of nodeMap.values()) {
    if (node.parentToken && nodeMap.has(node.parentToken)) {
      nodeMap.get(node.parentToken)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  
  return roots;
}

export function getSelectedDocuments(
  nodes: DocumentTreeNode[],
): Array<{ token: string; parentToken?: string }> {
  const selected: Array<{ token: string; parentToken?: string }> = [];
  
  const traverse = (node: DocumentTreeNode) => {
    if (node.checked && node.type === 'docx') {
      selected.push({
        token: node.token,
        parentToken: node.parentToken || undefined,
      });
    }
    
    for (const child of node.children) {
      traverse(child);
    }
  };
  
  for (const root of nodes) {
    traverse(root);
  }
  
  return selected;
}

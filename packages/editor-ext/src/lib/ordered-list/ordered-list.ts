import OrderedList from '@tiptap/extension-ordered-list';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * 自定义有序列表扩展，支持标题的层级编号
 * 
 * 功能：
 * - H1 标题：1., 2., 3. ...
 * - H2 标题：1.1, 1.2, 2.1, 2.2 ...
 * - H3 标题：1.1.1, 1.1.2, 1.2.1 ...
 * - 普通段落：独立编号 1., 2., 3. ...
 * - 支持自定义编号起始值
 * - PRD 规则：缺失父级时从 1 开始，不显示 "0.x"
 */
export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      start: {
        default: 1,
        parseHTML: element => {
          return element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '1', 10)
            : 1;
        },
        renderHTML: attributes => {
          return attributes.start === 1
            ? {}
            : { start: attributes.start };
        },
      },
      // 添加一个属性来标记是否包含标题
      hasHeading: {
        default: false,
        parseHTML: element => {
          return element.hasAttribute('data-has-heading')
            ? element.getAttribute('data-has-heading') === 'true'
            : false;
        },
        renderHTML: attributes => {
          return attributes.hasHeading
            ? { 'data-has-heading': 'true' }
            : {};
        },
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['listItem'],
        attributes: {
          // 存储标题级别，用于计算编号
          headingLevel: {
            default: null,
            parseHTML: element => {
              const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
              if (heading) {
                return parseInt(heading.tagName.substring(1));
              }
              return null;
            },
            renderHTML: attributes => {
              return attributes.headingLevel
                ? { 'data-heading-level': attributes.headingLevel }
                : {};
            },
          },
          // 计算出的编号（用于显示）
          computedNumber: {
            default: null,
            parseHTML: element => {
              return element.hasAttribute('data-computed-number')
                ? element.getAttribute('data-computed-number')
                : null;
            },
            renderHTML: attributes => {
              return attributes.computedNumber
                ? { 'data-computed-number': attributes.computedNumber }
                : {};
            },
          },
          // 自定义编号值（用于覆盖自动计数）
          customNumber: {
            default: null,
            parseHTML: element => {
              return element.hasAttribute('data-custom-number')
                ? element.getAttribute('data-custom-number')
                : null;
            },
            renderHTML: attributes => {
              return attributes.customNumber
                ? { 'data-custom-number': attributes.customNumber }
                : {};
            },
          },
          // 是否重新开始编号
          restartNumbering: {
            default: false,
            parseHTML: element => {
              return element.hasAttribute('data-restart-numbering')
                ? element.getAttribute('data-restart-numbering') === 'true'
                : false;
            },
            renderHTML: attributes => {
              return attributes.restartNumbering
                ? { 'data-restart-numbering': 'true' }
                : {};
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      // Plugin 1: 渲染编号装饰器
      new Plugin({
        key: new PluginKey('headingNumberingDecorations'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            
            state.doc.descendants((node, pos) => {
              // 处理有序列表
              if (node.type.name === 'orderedList') {
                // 每个列表独立的普通段落计数器
                let plainParagraphCounter = 0;
                
                // 遍历列表中的每个列表项
                node.forEach((listItem, offset) => {
                  if (listItem.type.name !== 'listItem') return;
                  
                  const listItemPos = pos + offset + 1;
                  
                  // 查找列表项中的第一个标题（如果有多个子节点，优先处理标题）
                  let headingChild = null;
                  let headingChildPos = 0;
                  let currentPos = listItemPos + 1;
                  
                  listItem.forEach((child) => {
                    if (!headingChild && child.type.name === 'heading') {
                      headingChild = child;
                      headingChildPos = currentPos;
                    }
                    currentPos += child.nodeSize;
                  });
                  
                  // 如果找到标题，处理标题编号
                  if (headingChild) {
                    // 遇到标题时，重置普通段落计数器
                    plainParagraphCounter = 0;
                    // 处理标题编号
                    const computedNumber = listItem.attrs.computedNumber;
                    const customNumber = listItem.attrs.customNumber;
                    const headingLevel = listItem.attrs.headingLevel;
                    
                    // 优先使用自定义编号，否则使用计算的编号
                    const displayNumber = customNumber || computedNumber;
                    
                    if (displayNumber && headingLevel) {
                      // 使用找到的标题位置
                      const headingPos = headingChildPos;
                    // 根据标题级别设置字号
                    const fontSizes: Record<number, string> = {
                      1: '2.125rem',  // H1
                      2: '1.625rem',  // H2
                      3: '1.375rem',  // H3
                      4: '1.125rem',  // H4
                      5: '1rem',      // H5
                      6: '1rem',      // H6
                    };
                    
                    const fontSize = fontSizes[headingLevel] || '1rem';
                    
                    // 创建一个 widget 装饰器，在标题内容前插入编号
                    const savedListItemPos = listItemPos; // 保存列表项位置
                    const widget = Decoration.widget(headingPos + 1, () => {
                      const span = document.createElement('span');
                      span.className = `heading-number heading-number-h${headingLevel}`;
                      span.textContent = `${displayNumber}. `;
                      span.title = '设置编号'; // 添加鼠标悬停提示
                      span.setAttribute('data-number', displayNumber);
                      span.setAttribute('data-list-item-pos', savedListItemPos.toString());
                      span.style.cssText = `
                        display: inline;
                        margin-right: 0;
                        font-size: ${fontSize};
                        font-weight: 700;
                        line-height: inherit;
                        color: var(--mantine-color-text, #000);
                        user-select: none;
                        pointer-events: auto;
                        cursor: pointer;
                      `;
                      
                      // 添加点击事件处理
                      span.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // 触发自定义事件，传递编号和位置信息
                        const event = new CustomEvent('heading-number-click', {
                          detail: {
                            number: displayNumber,
                            position: savedListItemPos,
                            rect: span.getBoundingClientRect(),
                          },
                          bubbles: true,
                        });
                        span.dispatchEvent(event);
                      });
                      
                      return span;
                    }, {
                      side: -1,
                      key: `heading-number-${headingPos}-${displayNumber}`,
                    });
                    
                      decorations.push(widget);
                    }
                  } else {
                    // 没有标题，检查是否是普通段落
                    const firstChild = listItem.firstChild;
                    if (firstChild && firstChild.type.name === 'paragraph') {
                      // 普通段落递增计数器
                      plainParagraphCounter++;
                      const currentNumber = plainParagraphCounter; // 立即捕获当前值
                      
                      // 为普通段落创建编号 widget - 插入到段落内部开头
                      // listItemPos 是 listItem 的起始位置
                      // +1 跳过 listItem 的开始标记，到达第一个子节点（paragraph）的位置
                      // +1 再跳过 paragraph 的开始标记，到达段落内容的开始位置
                      const paragraphContentPos = listItemPos + 1 + 1;
                      const widget = Decoration.widget(paragraphContentPos, () => {
                        const span = document.createElement('span');
                        span.className = 'paragraph-number';
                        span.textContent = `${currentNumber}. `;
                        span.style.cssText = `
                          display: inline;
                          margin-right: 0.25em;
                          font-weight: 400;
                          color: var(--mantine-color-text, #000);
                          user-select: none;
                        `;
                        
                        return span;
                      }, {
                        side: -1,
                        key: `paragraph-number-${paragraphContentPos}-${currentNumber}`,
                      });
                      
                      decorations.push(widget);
                    }
                  }
                });
              }
            });
            
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
      // Plugin 2: 计算编号和修复异常结构
      new Plugin({
        key: new PluginKey('headingNumbering'),
        appendTransaction: (transactions, oldState, newState) => {
          // 只在文档内容变化时重新计算编号
          const docChanged = transactions.some(tr => tr.docChanged);
          if (!docChanged) {
            return null;
          }

  
          const tr = newState.tr;
          let modified = false;

          // 首先检测并修复异常的列表项结构（包含多个块级元素）
          const itemsToFix: Array<{ pos: number; node: any }> = [];
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'listItem' && node.childCount > 1) {
              // 检查是否有多个块级元素
              let blockCount = 0;
              node.forEach((child) => {
                if (child.type.name === 'paragraph' || child.type.name === 'heading') {
                  blockCount++;
                }
              });
              
              if (blockCount > 1) {
                itemsToFix.push({ pos, node });
              }
            }
          });

          // 如果发现异常结构，不自动修复（避免破坏用户内容）
          // 用户需要手动修复这些异常结构

          // 遍历文档，计算每个有序列表中的标题编号
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'orderedList') {
      
              // 计数器 - 用于跟踪每个级别的标题数量
              const counters = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
              // 标记是否遇到过某个级别的标题
              const hasLevel = { h1: false, h2: false, h3: false, h4: false, h5: false, h6: false };
              // 普通段落计数器（每个列表独立计数）
              let paragraphCounter = 0;
              
              // 遍历列表项
              node.forEach((listItem, offset) => {
                if (listItem.type.name === 'listItem') {
                  const listItemPos = pos + offset + 1;
                  
                  // 查找列表项中的第一个子节点
                  const firstChild = listItem.firstChild;
                  if (!firstChild) {
                    return;
                  }

                  const nodeName = firstChild.type.name;
                  
                  // 如果是标题
                  if (nodeName === 'heading') {
                    const level = firstChild.attrs.level;
                    const headingKey = `h${level}` as keyof typeof counters;
                    
                    // 递增当前级别计数器
                    counters[headingKey]++;
                    hasLevel[headingKey] = true;
                    
                    // 重置下级计数器
                    for (let i = level + 1; i <= 6; i++) {
                      counters[`h${i}` as keyof typeof counters] = 0;
                      hasLevel[`h${i}` as keyof typeof hasLevel] = false;
                    }
                    
                    // 计算编号（PRD 规则：缺失父级时从 1 开始）
                    let computedNumber = '';
                    
                    if (level === 1) {
                      // H1: 直接显示 "1", "2", "3"
                      computedNumber = `${counters.h1}`;
                    } else if (level === 2) {
                      // H2: 如果没有 H1，显示为 "1", "2"；否则显示为 "1.1", "1.2"
                      if (!hasLevel.h1) {
                        computedNumber = `${counters.h2}`;
                      } else {
                        computedNumber = `${counters.h1}.${counters.h2}`;
                      }
                    } else if (level === 3) {
                      // H3: 根据父级情况决定格式
                      if (!hasLevel.h1 && !hasLevel.h2) {
                        // 没有 H1 和 H2：显示为 "1", "2"
                        computedNumber = `${counters.h3}`;
                      } else if (!hasLevel.h1 && hasLevel.h2) {
                        // 没有 H1 但有 H2：显示为 "1.1", "1.2"
                        computedNumber = `${counters.h2}.${counters.h3}`;
                      } else if (hasLevel.h1 && !hasLevel.h2) {
                        // 有 H1 但没有 H2：显示为 "1.1", "1.2"
                        computedNumber = `${counters.h1}.${counters.h3}`;
                      } else {
                        // 都有：显示为 "1.1.1", "1.1.2"
                        computedNumber = `${counters.h1}.${counters.h2}.${counters.h3}`;
                      }
                    } else {
                      // H4-H6: 使用完整路径，缺失的父级用 1 填充
                      const parts = [];
                      for (let i = 1; i <= level; i++) {
                        const key = `h${i}` as keyof typeof counters;
                        parts.push(hasLevel[key] ? counters[key] : 1);
                      }
                      computedNumber = parts.join('.');
                    }
                    
                    // 只在没有自定义编号或编号变化时更新
                    const currentComputedNumber = listItem.attrs.computedNumber;
                    const hasCustomNumber = listItem.attrs.customNumber;
                    
                    // 如果有自定义编号，不更新 computedNumber
                    if (!hasCustomNumber && currentComputedNumber !== computedNumber) {
                      tr.setNodeMarkup(listItemPos, undefined, {
                        ...listItem.attrs,
                        computedNumber,
                        headingLevel: level,
                      });
                      modified = true;
                    } else if (!hasCustomNumber && !listItem.attrs.headingLevel) {
                      // 确保 headingLevel 被设置
                      tr.setNodeMarkup(listItemPos, undefined, {
                        ...listItem.attrs,
                        computedNumber,
                        headingLevel: level,
                      });
                      modified = true;
                    }
                  }
                  // 如果是普通段落
                  else if (nodeName === 'paragraph') {
                    // 递增普通段落计数器
                    paragraphCounter++;
                    
                    // 清除标题相关属性（如果之前是标题转换来的）
                    if (listItem.attrs.headingLevel || listItem.attrs.computedNumber) {
                      tr.setNodeMarkup(listItemPos, undefined, {
                        ...listItem.attrs,
                        headingLevel: null,
                        computedNumber: null,
                        customNumber: null,
                      });
                      modified = true;
                    }
                  }
                }
              });
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, NodeSelection, TextSelection } from '@tiptap/pm/state';
import { Slice, Fragment } from '@tiptap/pm/model';
import * as pmView from '@tiptap/pm/view';
import { createRoot, Root } from 'react-dom/client';

function getPmView() {
    try {
        return pmView;
    }
    catch (error) {
        return null;
    }
}

function serializeForClipboard(view: any, slice: Slice) {
    // Newer Tiptap/ProseMirror
    if (view && typeof view.serializeForClipboard === 'function') {
        return view.serializeForClipboard(slice);
    }
    // Older version fallback
    const proseMirrorView = getPmView();
    if (proseMirrorView && typeof (proseMirrorView as any)['__serializeForClipboard'] === 'function') {
        return (proseMirrorView as any)['__serializeForClipboard'](view, slice);
    }
    throw new Error('No supported clipboard serialization method found.');
}

function absoluteRect(node: Element) {
    const data = node.getBoundingClientRect();
    const modal = node.closest('[role="dialog"]');
    if (modal && window.getComputedStyle(modal).transform !== 'none') {
        const modalRect = modal.getBoundingClientRect();
        return {
            top: data.top - modalRect.top,
            left: data.left - modalRect.left,
            width: data.width,
        };
    }
    return {
        top: data.top,
        left: data.left,
        width: data.width,
    };
}

function nodeDOMAtCoords(coords: { x: number; y: number }, options: GlobalDragHandleOptions) {
    const selectors = [
        'li',
        'p:not(:first-child)',
        'pre',
        'blockquote',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'table',
        ...options.customNodes.map((node) => `[data-type=${node}]`),
    ].join(', ');
    return document
        .elementsFromPoint(coords.x, coords.y)
        .find((elem) => elem.parentElement?.matches?.('.ProseMirror') ||
        elem.matches(selectors));
}

function nodePosAtDOM(node: Element, view: any, options: GlobalDragHandleOptions) {
    const boundingRect = node.getBoundingClientRect();
    return view.posAtCoords({
        left: boundingRect.left + 50 + options.dragHandleWidth,
        top: boundingRect.top + 1,
    })?.inside;
}

function calcNodePos(pos: number, view: any) {
    const $pos = view.state.doc.resolve(pos);
    if ($pos.depth > 1)
        return $pos.before($pos.depth);
    return pos;
}

export interface GlobalDragHandleOptions {
    dragHandleWidth: number;
    scrollTreshold: number;
    dragHandleSelector?: string;
    excludedTags: string[];
    customNodes: string[];
    renderContent?: (node: any) => any;
    pluginKey?: string;
}

function DragHandlePlugin(options: GlobalDragHandleOptions) {
    let listType = '';
    // 用于去重日志的 Set
    const loggedTypes = new Set<string>();
    
    function handleDragStart(event: DragEvent, view: any) {
        view.focus();
        if (!event.dataTransfer)
            return;
        const node = nodeDOMAtCoords({
            x: event.clientX + 50 + options.dragHandleWidth,
            y: event.clientY,
        }, options);
        if (!(node instanceof Element))
            return;
        let draggedNodePos = nodePosAtDOM(node, view, options);
        if (draggedNodePos == null || draggedNodePos < 0)
            return;
        draggedNodePos = calcNodePos(draggedNodePos, view);
        const { from, to } = view.state.selection;
        const diff = from - to;
        const fromSelectionPos = calcNodePos(from, view);
        let differentNodeSelected = false;
        const nodePos = view.state.doc.resolve(fromSelectionPos);
        // Check if nodePos points to the top level node
        if (nodePos.node().type.name === 'doc')
            differentNodeSelected = true;
        else {
            const nodeSelection = NodeSelection.create(view.state.doc, nodePos.before());
            // Check if the node where the drag event started is part of the current selection
            differentNodeSelected = !(draggedNodePos + 1 >= nodeSelection.$from.pos &&
                draggedNodePos <= nodeSelection.$to.pos);
        }
        let selection = view.state.selection;
        if (!differentNodeSelected &&
            diff !== 0 &&
            !(view.state.selection instanceof NodeSelection)) {
            const endSelection = NodeSelection.create(view.state.doc, to - 1);
            selection = TextSelection.create(view.state.doc, draggedNodePos, endSelection.$to.pos);
        }
        else {
            selection = NodeSelection.create(view.state.doc, draggedNodePos);
            // if inline node is selected, e.g mention -> go to the parent node to select the whole node
            // if table row is selected, go to the parent node to select the whole node
            if (selection.node.type.isInline ||
                selection.node.type.name === 'tableRow') {
                let $pos = view.state.doc.resolve(selection.from);
                selection = NodeSelection.create(view.state.doc, $pos.before());
            }
        }
        view.dispatch(view.state.tr.setSelection(selection));
        // If the selected node is a list item, we need to save the type of the wrapping list e.g. OL or UL
        if (view.state.selection instanceof NodeSelection &&
            view.state.selection.node.type.name === 'listItem') {
            listType = node.parentElement.tagName;
        }
        const slice = view.state.selection.content();
        const { dom, text } = serializeForClipboard(view, slice);
        event.dataTransfer.clearData();
        event.dataTransfer.setData('text/html', dom.innerHTML);
        event.dataTransfer.setData('text/plain', text);
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.setDragImage(node, 0, 0);
        view.dragging = { slice, move: event.ctrlKey };
    }
    
    let dragHandleElement: HTMLElement | null = null;
    let root: Root | null = null;
    let isDestroyed = false; // Track destroyed state to prevent updates
    
    function hideDragHandle() {
        if (dragHandleElement) {
            dragHandleElement.classList.add('hide');
        }
    }
    
    function showDragHandle() {
        if (dragHandleElement) {
            dragHandleElement.classList.remove('hide');
        }
    }
    
    function hideHandleOnEditorOut(event) {
        if (event.target instanceof Element) {
            // Check if the relatedTarget class is still inside the editor or drag handle
            const relatedTarget = event.relatedTarget;
            const isInsideEditor = relatedTarget?.classList.contains('tiptap') ||
                relatedTarget?.classList.contains('drag-handle') ||
                relatedTarget?.classList.contains('drag-handle-container') ||
                relatedTarget?.classList.contains('block-type-label') ||
                relatedTarget?.classList.contains('drag-handle-icon') ||
                relatedTarget?.closest('.drag-handle') ||
                relatedTarget?.closest('.drag-handle-container');
            if (isInsideEditor)
                return;
        }
        hideDragHandle();
    }
    
    return new Plugin({
        key: new PluginKey('globalDragHandle'),
        view: (view) => {
            isDestroyed = false; // Reset destroyed state on new view initialization
            const handleBySelector = options.dragHandleSelector
                ? document.querySelector(options.dragHandleSelector)
                : null;
            dragHandleElement = (handleBySelector as HTMLElement) ?? document.createElement('div');
            dragHandleElement.draggable = true;
            dragHandleElement.dataset.dragHandle = '';
            dragHandleElement.classList.add('drag-handle');
            
            // Create React root for drag handle content
            if (!root) {
                root = createRoot(dragHandleElement);
            }
            
            function onDragHandleDragStart(e) {
                handleDragStart(e, view);
            }
            dragHandleElement.addEventListener('dragstart', onDragHandleDragStart);
            
            function onDragHandleDrag(e) {
                hideDragHandle();
                let scrollY = window.scrollY;
                if (e.clientY < options.scrollTreshold) {
                    window.scrollTo({ top: scrollY - 30, behavior: 'smooth' });
                }
                else if (window.innerHeight - e.clientY < options.scrollTreshold) {
                    window.scrollTo({ top: scrollY + 30, behavior: 'smooth' });
                }
            }
            dragHandleElement.addEventListener('drag', onDragHandleDrag);
            
            hideDragHandle();
            
            if (!handleBySelector) {
                view?.dom?.parentElement?.appendChild(dragHandleElement);
            }
            view?.dom?.parentElement?.addEventListener('mouseout', hideHandleOnEditorOut);
            
            return {
                destroy: () => {
                    isDestroyed = true; // Mark as destroyed immediately
                    
                    // Safely unmount React root
                    // Capture the root in a local variable for the closure
                    const rootToUnmount = root;
                    if (rootToUnmount) {
                        // Use setTimeout to unmount after current stack clears, 
                        // avoiding issues if unmount happens during an update cycle
                        setTimeout(() => {
                            try {
                                rootToUnmount.unmount();
                            } catch (e) {
                                // Ignore errors during unmount (e.g. if already unmounted)
                                // console.warn('Error unmounting drag handle root:', e);
                            }
                        }, 0);
                    }
                    
                    root = null;

                    if (!handleBySelector) {
                        dragHandleElement?.remove?.();
                    }
                    dragHandleElement?.removeEventListener('drag', onDragHandleDrag);
                    dragHandleElement?.removeEventListener('dragstart', onDragHandleDragStart);
                    dragHandleElement = null;
                    view?.dom?.parentElement?.removeEventListener('mouseout', hideHandleOnEditorOut);
                },
            };
        },
        props: {
            handleDOMEvents: {
                mousemove: (view, event) => {
                    // Bail out if destroyed or view is not editable
                    if (isDestroyed || !view.editable) {
                        return;
                    }
                    
                    // Check if mouse is over the drag handle itself
                    const target = event.target as Element;
                    const isOverDragHandle = target?.closest('.drag-handle') || 
                                            target?.closest('.drag-handle-container') ||
                                            target?.classList.contains('drag-handle') ||
                                            target?.classList.contains('drag-handle-container') ||
                                            target?.classList.contains('block-type-label') ||
                                            target?.classList.contains('drag-handle-icon');
                    
                    // If mouse is over drag handle, keep it visible
                    if (isOverDragHandle) {
                        showDragHandle();
                        return;
                    }
                    
                    const nodeDOM = nodeDOMAtCoords({
                        x: event.clientX + 50 + options.dragHandleWidth,
                        y: event.clientY,
                    }, options);
                    
                    const notDragging = nodeDOM?.closest('.not-draggable');
                    const excludedTagList = options.excludedTags
                        .concat(['ol', 'ul'])
                        .join(', ');
                    
                    if (!(nodeDOM instanceof Element) ||
                        nodeDOM.matches(excludedTagList) ||
                        notDragging) {
                        hideDragHandle();
                        return;
                    }
                    
                    const compStyle = window.getComputedStyle(nodeDOM);
                    const parsedLineHeight = parseInt(compStyle.lineHeight, 10);
                    const lineHeight = isNaN(parsedLineHeight)
                        ? parseInt(compStyle.fontSize) * 1.2
                        : parsedLineHeight;
                    const paddingTop = parseInt(compStyle.paddingTop, 10);
                    const rect = absoluteRect(nodeDOM);
                    rect.top += (lineHeight - 24) / 2;
                    rect.top += paddingTop;
                    
                    // Unordered List markers (bullets) are outside the content box, 
                    // so we need to shift the handle further left to avoid overlapping with the bullet.
                    // Ordered List (ol) numbers are handled via custom CSS (::before) inside the padded li,
                    // so they don't need this extra shift.
                    if (nodeDOM.matches('ul:not([data-type=taskList]) li')) {
                        rect.left -= options.dragHandleWidth;
                    }

                    rect.width = options.dragHandleWidth;
                    
                    if (!dragHandleElement)
                        return;
                        
                    dragHandleElement.style.left = `${rect.left - rect.width - 20}px`;
                    dragHandleElement.style.top = `${rect.top + 5}px`;
                    
                    // Custom Content Rendering Logic
                    if (options.renderContent) {
                        // Try to get node type from DOM data-type attribute
                        let nodeType = nodeDOM.getAttribute?.('data-type');
                        let targetNode = null;
                        

                        
                        // Improved node finding strategy: find directly from view.domAtPos
                        try {
                            // Try to find the corresponding ProseMirror position from the DOM element
                            let domPos = view.posAtDOM(nodeDOM, 0);
                            
                            // For HR and other leaf nodes, try getting position before the element
                            if (domPos < 0 || domPos === undefined) {
                                const rect = nodeDOM.getBoundingClientRect();
                                const coords = view.posAtCoords({
                                    left: rect.left + 1,
                                    top: rect.top + 1
                                });
                                if (coords) {
                                    domPos = coords.pos;
                                }
                            }
                            
                            if (domPos >= 0) {
                                const $pos = view.state.doc.resolve(domPos);
                                
                                // Check if the node at this position is what we're looking for
                                const nodeAtPos = $pos.nodeAfter || $pos.nodeBefore || $pos.parent;
                                if (nodeAtPos && nodeAtPos.type.name !== 'doc' && nodeAtPos.type.name !== 'text') {
                                    // For listItem or taskItem, use the parent list type
                                    if (nodeAtPos.type.name === 'listItem' || nodeAtPos.type.name === 'taskItem') {
                                        // Find the parent list by searching upward
                                        for (let d = $pos.depth; d >= 0; d--) {
                                            const node = $pos.node(d);
                                            if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
                                                targetNode = node;
                                                break;
                                            }
                                        }
                                        if (!targetNode) {
                                            targetNode = nodeAtPos;
                                        }
                                    } else if (nodeAtPos.type.name === 'paragraph') {
                                        // Check if this paragraph is inside a listItem
                                        for (let d = $pos.depth; d >= 0; d--) {
                                            const node = $pos.node(d);
                                            if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
                                                // Found listItem parent, now find the list
                                                for (let d2 = d - 1; d2 >= 0; d2--) {
                                                    const listNode = $pos.node(d2);
                                                    if (listNode.type.name === 'bulletList' || 
                                                        listNode.type.name === 'orderedList' || 
                                                        listNode.type.name === 'taskList') {
                                                        targetNode = listNode;
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        // If not in a list, use the paragraph itself
                                        if (!targetNode) {
                                            targetNode = nodeAtPos;
                                        }
                                    } else {
                                        targetNode = nodeAtPos;
                                    }
                                } else {
                                    // Search upward for the first block-level node
                                    for (let d = $pos.depth; d >= 0; d--) {
                                        const node = $pos.node(d);
                                        
                                        if (node.isBlock && node.type.name !== 'doc') {
                                            // Special handling: if this is a paragraph inside a listItem, use the parent list
                                            if (node.type.name === 'paragraph' && d > 0) {
                                                const parentNode = $pos.node(d - 1);
                                                if (parentNode.type.name === 'listItem' || parentNode.type.name === 'taskItem') {
                                                    // Find the grandparent list
                                                    if (d > 1) {
                                                        const grandParentList = $pos.node(d - 2);
                                                        if (grandParentList.type.name === 'bulletList' || 
                                                            grandParentList.type.name === 'orderedList' || 
                                                            grandParentList.type.name === 'taskList') {
                                                            targetNode = grandParentList;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            // For listItem or taskItem, use the parent list type
                                            if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
                                                // Get the parent list (bulletList, orderedList, or taskList)
                                                if (d > 0) {
                                                    const parentList = $pos.node(d - 1);
                                                    targetNode = parentList;
                                                } else {
                                                    targetNode = node;
                                                }
                                            } else {
                                                targetNode = node;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            // Silently handle errors
                        }
                        
                        // If no node found, try to find from parent or sibling with data-type
                        if (!targetNode) {
                            // Check parent elements for data-type or data-node-view-wrapper
                            let parent = nodeDOM.parentElement;
                            while (parent && parent !== view.dom) {
                                const parentDataType = parent.getAttribute('data-type');
                                if (parentDataType) {
                                    nodeType = parentDataType;
                                    // Create a mock node for rendering
                                    targetNode = { type: { name: parentDataType } } as any;
                                    break;
                                }
                                
                                // Check if this is a NodeViewWrapper
                                if (parent.hasAttribute('data-node-view-wrapper')) {
                                    // Try to get position from this wrapper
                                    try {
                                        const wrapperPos = view.posAtDOM(parent, 0);
                                        if (wrapperPos >= 0) {
                                            const $pos = view.state.doc.resolve(wrapperPos);
                                            for (let d = $pos.depth; d >= 0; d--) {
                                                const node = $pos.node(d);
                                                if (node.isBlock && node.type.name !== 'doc') {
                                                    targetNode = node;
                                                    break;
                                                }
                                            }
                                            if (targetNode) break;
                                        }
                                    } catch (e) {
                                        // Continue searching
                                    }
                                }
                                
                                parent = parent.parentElement;
                            }
                        }
                        
                        // If DOM has data-type, use it preferentially
                        if (targetNode && nodeType) {
                            targetNode = { ...targetNode, type: { ...targetNode.type, name: nodeType } };
                        }
                        
                        // Render icon
                        if (targetNode && targetNode.type.name !== 'doc') {
                            const content = options.renderContent(targetNode);
                            if (content && root && !isDestroyed) {
                                try {
                                    root.render(content);
                                } catch (e) {
                                    isDestroyed = true;
                                }
                            }
                        }
                    }
                    
                    showDragHandle();
                },
                keydown: () => {
                    hideDragHandle();
                },
                mousewheel: () => {
                    hideDragHandle();
                },
                // dragging updates
                dragstart: (view) => {
                    view.dom.classList.add('dragging');
                },
                drop: (view, event) => {
                    view.dom.classList.remove('dragging');
                    hideDragHandle();
                    let droppedNode = null;
                    const dropPos = view.posAtCoords({
                        left: event.clientX,
                        top: event.clientY,
                    });
                    if (!dropPos)
                        return;
                    if (view.state.selection instanceof NodeSelection) {
                        droppedNode = view.state.selection.node;
                    }
                    if (!droppedNode)
                        return;
                    const resolvedPos = view.state.doc.resolve(dropPos.pos);
                    const isDroppedInsideList = resolvedPos.parent.type.name === 'listItem';
                    // If the selected node is a list item and is not dropped inside a list, we need to wrap it inside <ol> tag otherwise ol list items will be transformed into ul list item when dropped
                    if (view.state.selection instanceof NodeSelection &&
                        view.state.selection.node.type.name === 'listItem' &&
                        !isDroppedInsideList &&
                        listType == 'OL') {
                        const newList = view.state.schema.nodes.orderedList?.createAndFill(null, droppedNode);
                        const slice = new Slice(Fragment.from(newList), 0, 0);
                        view.dragging = { slice, move: event.ctrlKey };
                    }
                },
                dragend: (view) => {
                    view.dom.classList.remove('dragging');
                    
                    // Force view update to ensure CSS counters recalculate
                    // This fixes the issue where ordered list numbers don't update after drag and drop
                    requestAnimationFrame(() => {
                        view.updateState(view.state);
                    });
                },
            },
        },
    });
}

export const CustomGlobalDragHandle = Extension.create<GlobalDragHandleOptions>({
    name: 'globalDragHandle',
    addOptions() {
        return {
            dragHandleWidth: 20,
            scrollTreshold: 100,
            excludedTags: [],
            customNodes: [],
            renderContent: undefined,
        };
    },
    addProseMirrorPlugins() {
        return [
            DragHandlePlugin({
                pluginKey: 'globalDragHandle',
                dragHandleWidth: this.options.dragHandleWidth,
                scrollTreshold: this.options.scrollTreshold,
                dragHandleSelector: this.options.dragHandleSelector,
                excludedTags: this.options.excludedTags,
                customNodes: this.options.customNodes,
                renderContent: this.options.renderContent,
            }),
        ];
    },
});

export default CustomGlobalDragHandle;

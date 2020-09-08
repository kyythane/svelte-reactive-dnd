import type {
    Rect,
    HoverResult,
    Position,
    Id,
    Placement,
    DragTarget,
    Layout,
    PaddingMap,
    Direction,
} from './types';
import type { Writable } from 'svelte/store';

export function makeDraggableElement(
    originalElement: HTMLDivElement,
    id: Id
): HTMLDivElement {
    const rect = originalElement.getBoundingClientRect();
    const draggedEl = originalElement.cloneNode(true) as HTMLDivElement;
    draggedEl.id = `reactive-dnd-drag-placeholder`;
    draggedEl.style.position = 'fixed';
    draggedEl.style.top = `${rect.top}px`;
    draggedEl.style.left = `${rect.left}px`;
    draggedEl.style.zIndex = '9999';
    applyCursor(draggedEl, id, 'grabbing');
    return draggedEl;
}

function applyCursor(element: HTMLElement, id: Id, cursor: string): void {
    element.style.cursor = cursor;
    const dragHandle = element.querySelector(
        `#reactive-dnd-drag-handle-${id}`
    ) as HTMLDivElement;
    if (!!dragHandle) {
        dragHandle.style.cursor = cursor;
    }
}

export function updateCursor(
    dragTarget: Writable<DragTarget>,
    canDrop: boolean,
    hasDropTarget: boolean
): void {
    const cursor = hasDropTarget && !canDrop ? 'not-allowed' : 'grabbing';
    dragTarget.update((target) => {
        if (target.cursor !== cursor) {
            target.cursor = cursor;
            applyCursor(target.dragElement, target.item.id, cursor);
        }
        return target;
    });
}

export function overlap(rect1: Rect, toCompare: Rect | Layout): boolean {
    if ('rect' in toCompare) {
        const rect2 = {
            x: toCompare.rect.x - toCompare.offsets.paddingLeft,
            y: toCompare.rect.y - toCompare.offsets.paddingTop,
            width:
                rect1.width +
                toCompare.offsets.paddingLeft +
                toCompare.offsets.paddingRight,
            height:
                rect1.height +
                toCompare.offsets.paddingTop +
                toCompare.offsets.paddingBottom,
        };
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect1.y + rect1.height < rect2.y ||
            rect2.x + rect2.width < rect1.x ||
            rect2.y + rect2.height < rect1.y
        );
    } else {
        return !(
            rect1.x + rect1.width < toCompare.x ||
            rect1.y + rect1.height < toCompare.y ||
            toCompare.x + toCompare.width < rect1.x ||
            toCompare.y + toCompare.height < rect1.y
        );
    }
}

export function percentOverlap(
    rect1: Rect,
    rect2: Rect
): { overlapX: number; overlapY: number } {
    const maxX = Math.min(rect1.width + rect1.x, rect2.width + rect2.x);
    const minX = Math.max(rect1.x, rect2.x);
    const maxY = Math.min(rect1.height + rect1.y, rect2.height + rect2.y);
    const minY = Math.max(rect1.y, rect2.y);
    return {
        overlapX: Math.max(maxX - minX, 0) / rect1.width,
        overlapY: Math.max(maxY - minY, 0) / rect1.height,
    };
}

export function computeMidpoint(rect: Rect): Position {
    return { x: rect.width / 2 + rect.x, y: rect.height / 2 + rect.y };
}

export function createLayout(rect: Rect): Layout {
    return {
        rect,
        offsets: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
        },
    };
}

export function removePaddingFromHoverResult(result: HoverResult): void {
    result.element.style.paddingTop = '';
    result.element.style.paddingBottom = '';
    result.element.style.paddingLeft = '';
    result.element.style.paddingRight = '';
}

export function updateContainingStyleSize(
    containingElement: HTMLDivElement,
    direction: 'horizontal' | 'vertical',
    amount: number
): void {
    if (direction === 'horizontal') {
        containingElement.style.width = `${amount}px`;
    } else {
        containingElement.style.height = `${amount}px`;
    }
}

export function calculatePlacement(
    dragRect: Rect,
    layout: Layout,
    direction: 'horizontal' | 'vertical'
): Placement {
    const key = direction === 'horizontal' ? 'x' : 'y';
    return computeMidpoint(dragRect)[key] < computeMidpoint(layout.rect)[key]
        ? 'before'
        : 'after';
}

export function growOrShrinkLayoutInList(
    layouts: Array<Layout>,
    startIndex: number,
    delta: number,
    direction: Direction,
    placement: Placement,
    paddingMap: PaddingMap
): Array<Layout> {
    const newLayouts = [...layouts];
    const deltaPosition =
        direction === 'horizontal' ? { x: delta, y: 0 } : { x: 0, y: delta };
    newLayouts[startIndex] = resizeLayout(
        newLayouts[startIndex],
        delta,
        direction,
        placement,
        paddingMap
    );
    for (let i: number = startIndex + 1; i < newLayouts.length; i++) {
        newLayouts[i] = translateLayoutBy(newLayouts[i], deltaPosition);
    }
    return newLayouts;
}

function resizeLayout(
    layout: Layout,
    delta: number,
    direction: Direction,
    placement: Placement,
    paddingMap: PaddingMap
): Layout {
    const offsets = { ...layout.offsets };
    const rect = { ...layout.rect };
    offsets[paddingMap[placement]] += delta;
    if (placement === 'before') {
        if (direction === 'horizontal') {
            rect.x += delta;
        } else {
            rect.y += delta;
        }
    }
    return { rect, offsets };
}

export function translateLayoutsBy(
    layouts: Array<Layout>,
    startIndex: number,
    offset: Position
): Array<Layout> {
    const newLayouts = [...layouts];
    for (let i: number = startIndex; i < newLayouts.length; i++) {
        newLayouts[i] = translateLayoutBy(newLayouts[i], offset);
    }
    return newLayouts;
}

function translateLayoutBy(
    { rect: { x, y, width, height }, offsets }: Layout,
    offset: Position
): Layout {
    const rect = {
        x: x + offset.x,
        y: y + offset.y,
        width,
        height,
    };
    return { rect, offsets: offsets };
}

export function moveRectTo({ width, height }: Rect, { x, y }: Position): Rect {
    return { x, y, width, height };
}

export function clamp(num: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, num));
}

export function lerp(percent: number, min: number, max: number): number {
    return clamp(percent) * (max - min) + min;
}

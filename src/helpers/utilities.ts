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
    Item,
} from './types';
import type { Writable } from 'svelte/store';

export function createDebugRender(): CanvasRenderingContext2D {
    let canvas = document.getElementsByTagName('canvas')[0];
    if (!!canvas) {
        return canvas.getContext('2d');
    }
    canvas = document.createElement('canvas'); //Create a canvas element
    //Set canvas width/height
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    //Set canvas drawing area width/height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //Position canvas
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.zIndex = '100000';
    canvas.style.pointerEvents = 'none'; //Make sure you can click 'through' the canvas
    document.body.appendChild(canvas); //Append canvas to body element
    return canvas.getContext('2d');
}

export function renderDebugBoundingBoxes(
    dragTarget: DragTarget,
    currentlyDraggingOver: HoverResult,
    layouts: Layout[],
    debugRenderer: CanvasRenderingContext2D
): void {
    debugRenderer.clearRect(0, 0, window.innerWidth, window.innerHeight);
    layouts.forEach((layout) => {
        debugRenderer.beginPath();
        debugRenderer.rect(
            layout.rect.x - layout.offsets.paddingLeft,
            layout.rect.y - layout.offsets.paddingTop,
            layout.rect.width +
                layout.offsets.paddingLeft +
                layout.offsets.paddingRight,
            layout.rect.height +
                layout.offsets.paddingTop +
                layout.offsets.paddingBottom
        );
        debugRenderer.strokeStyle = '#ff0000';
        debugRenderer.stroke();
        debugRenderer.beginPath();
        debugRenderer.rect(
            layout.rect.x,
            layout.rect.y,
            layout.rect.width,
            layout.rect.height
        );
        debugRenderer.strokeStyle = '#0000ff';
        debugRenderer.stroke();
    });
    if (!!dragTarget) {
        debugRenderer.beginPath();
        debugRenderer.rect(
            dragTarget.cachedRect.x,
            dragTarget.cachedRect.y,
            dragTarget.cachedRect.width,
            dragTarget.cachedRect.height
        );
        debugRenderer.strokeStyle = '#000000';
        debugRenderer.stroke();
        if (!!currentlyDraggingOver) {
            debugRenderer.beginPath();
            const overMidpoint = computeMidpoint(
                layouts[currentlyDraggingOver.index].rect
            );
            const draggingMidpoint = computeMidpoint(dragTarget.cachedRect);
            debugRenderer.moveTo(overMidpoint.x, overMidpoint.y);
            debugRenderer.lineTo(draggingMidpoint.x, draggingMidpoint.y);
            debugRenderer.strokeStyle = '#00FF00';
            debugRenderer.stroke();
        }
    }
}

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

export function calculateDropPosition(
    layout: Layout,
    placement: Placement,
    direction: Direction
): Position {
    const position = { x: layout.rect.x, y: layout.rect.y };
    if (placement === 'after') {
        if (direction === 'horizontal') {
            position.x += layout.rect.width;
        } else {
            position.y += layout.rect.height;
        }
    } else {
        if (direction === 'horizontal') {
            position.x -= layout.offsets.paddingLeft;
        } else {
            position.y -= layout.offsets.paddingTop;
        }
    }
    return position;
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

function createLayout({ x, y, width, height }: Rect): Layout {
    return {
        rect: { x, y, width, height },
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

function overlap(rect1: Rect, layout: Layout): boolean {
    const rect2 = {
        x: layout.rect.x - layout.offsets.paddingLeft,
        y: layout.rect.y - layout.offsets.paddingTop,
        width:
            layout.rect.width +
            layout.offsets.paddingLeft +
            layout.offsets.paddingRight,
        height:
            layout.rect.height +
            layout.offsets.paddingTop +
            layout.offsets.paddingBottom,
    };
    return !(
        rect1.x + rect1.width < rect2.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.x + rect2.width < rect1.x ||
        rect2.y + rect2.height < rect1.y
    );
}

export function computeHoverResult(
    dragTarget: DragTarget,
    items: Item[],
    wrappingElements: { [id: string]: HTMLDivElement },
    layouts: Layout[],
    direction: Direction,
    lastHoverResult: HoverResult | undefined,
    crossingMode: 'edge' | 'center'
): HoverResult {
    if (items.length === 0) {
        return undefined;
    }
    const overlapping = findOverlapping(
        dragTarget,
        items,
        wrappingElements,
        layouts,
        direction
    );
    const axis = direction === 'horizontal' ? 'x' : 'y';
    if (overlapping.length === 0) {
        const lastLayout = layouts[layouts.length - 1];
        // Sanity check to make sure we are actually past the end of our list
        const afterLast = dragTarget.cachedRect[axis] > lastLayout.rect[axis];
        const index = afterLast ? items.length - 1 : 0;
        const item = items[index];
        const placement: Placement = afterLast ? 'after' : 'before';
        return {
            index,
            item,
            element: wrappingElements[(item.id as unknown) as string],
            placement,
        };
    }
    const hoverResult = overlapping.reduce((last, next) => {
        return distance(dragTarget.cachedRect, layouts[next.index], axis) <
            distance(dragTarget.cachedRect, layouts[last.index], axis)
            ? next
            : last;
    });
    if (crossingMode === 'edge' && lastHoverResult) {
        const collisionPlacement = collides(
            dragTarget,
            layouts[hoverResult.index],
            direction,
            hoverResult.placement
        );
        if (collisionPlacement !== 'transition') {
            hoverResult.placement = collisionPlacement;
        } else if (lastHoverResult.item.id === hoverResult.item.id) {
            hoverResult.placement = lastHoverResult.placement;
        }
    }
    return hoverResult;
}

export function computeLayouts(
    items: Item[],
    wrappingElements: { [id: string]: HTMLDivElement },
    layouts: Layout[]
): void {
    for (let index = 0; index < items.length; index++) {
        const cachedItem = items[index];
        const element = wrappingElements[(cachedItem.id as unknown) as string];
        if (index >= layouts.length || layouts[index] === undefined) {
            layouts[index] = createLayout(element.getBoundingClientRect());
        }
    }
}

function findOverlapping(
    dragTarget: DragTarget,
    items: Item[],
    wrappingElements: { [id: string]: HTMLDivElement },
    layouts: Layout[],
    direction: Direction
) {
    let overlapped = false;
    const overlapping: HoverResult[] = [];
    for (let index = 0; index < items.length; index++) {
        const cachedItem = items[index];
        const element = wrappingElements[(cachedItem.id as unknown) as string];
        if (index >= layouts.length || layouts[index] === undefined) {
            layouts[index] = createLayout(element.getBoundingClientRect());
        }
        const overlaps = overlap(dragTarget.cachedRect, layouts[index]);
        const placement = calculatePlacement(
            dragTarget.cachedRect,
            layouts[index],
            direction
        );
        if (overlaps) {
            overlapping.push({
                index,
                item: cachedItem,
                element,
                placement,
            });
            overlapped = true;
        } else if (overlapped) {
            break;
        }
    }
    return overlapping;
}

function distance(rect: Rect, layout: Layout, axis: 'x' | 'y') {
    return Math.abs(
        computeMidpoint(layout.rect)[axis] - computeMidpoint(rect)[axis]
    );
}

function collides(
    dragTarget: DragTarget,
    layout: Layout,
    direction: 'horizontal' | 'vertical',
    placement: Placement
): Placement | 'transition' {
    const cachedRect = dragTarget.cachedRect;
    const axis = direction === 'horizontal' ? 'x' : 'y';
    const dragSize =
        direction === 'horizontal' ? cachedRect.width : cachedRect.height;
    const dragMidpoint = computeMidpoint(cachedRect)[axis];
    const lastMidpoint =
        dragMidpoint + (dragTarget.lastPosition[axis] - cachedRect[axis]);
    const layoutMidpoint = computeMidpoint(layout.rect)[axis];
    const distance = layoutMidpoint - dragMidpoint;
    const lastDistance = layoutMidpoint - lastMidpoint;
    // outside to inside => collision
    if (
        Math.abs(distance) <= dragSize / 2 &&
        Math.abs(lastDistance) > dragSize / 2
    ) {
        return placement === 'before' ? 'after' : 'before';
    } else if (Math.abs(distance) <= dragSize / 2) {
        return 'transition';
    }
    return placement;
}

export function calculatePlacement(
    dragRect: Rect,
    layout: Layout,
    direction: 'horizontal' | 'vertical'
): Placement {
    const axis = direction === 'horizontal' ? 'x' : 'y';
    return computeMidpoint(dragRect)[axis] < computeMidpoint(layout.rect)[axis]
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
    { rect: { x, y, width, height }, offsets }: Layout,
    delta: number,
    direction: Direction,
    placement: Placement,
    paddingMap: PaddingMap
): Layout {
    offsets[paddingMap[placement]] += delta;
    if (placement === 'before') {
        if (direction === 'horizontal') {
            x += delta;
        } else {
            y += delta;
        }
    }
    return { rect: { x, y, width, height }, offsets };
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
    return { rect, offsets };
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

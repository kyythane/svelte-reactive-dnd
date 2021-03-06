export type Id = string | number;
export type Placement = 'before' | 'after';
export type Direction = 'horizontal' | 'vertical';
export type Item = { id: Id };
export type DragEventHandlers = {
    handleMouseDown: (event: MouseEvent, itemId: Id) => void;
    handleMouseUp: (event: MouseEvent) => void;
    handleMouseMove: (event: MouseEvent) => void;
};
export type HoverResult = {
    index: number;
    item: Item;
    element: HTMLDivElement;
    placement: Placement;
};
export type DropCallback = (dragTarget: HoverResult | undefined) => void;
export type HoverCallback = (fireEvent: boolean) => HoverResult | undefined;
export type CalculatePosition = (
    dragTarget: Pick<DragTarget, 'item' | 'cachedRect' | 'lastPosition'>,
    items: Item[],
    layouts: Layout[]
) => {
    index: number;
    placement?: Placement;
    scrollIntoView?: boolean;
};
export type Position = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Layout = {
    rect: Rect;
    offsets: {
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
    };
};
export type PaddingMap =
    | { before: 'paddingTop'; after: 'paddingBottom' }
    | { before: 'paddingLeft'; after: 'paddingRight' };
export type DropTarget = {
    id: number;
    key: () => string;
    clientIdentifier: () => Id;
    rect: Rect;
    dropElement: HTMLDivElement;
    dropCallback: DropCallback;
    hoverCallback: HoverCallback;
    prepareDropZone: () => void;
    enterDropZone: () => void;
    leaveDropZone: () => void;
    hasItem: (itemId: Id) => boolean;
    getEventHandlers: () => DragEventHandlers;
    cleanupDropZone: () => void;
    canDrop: () => boolean;
    disabled: () => boolean;
    dropPosition: () => Position;
};
export type DropTargetCache = {
    items: Array<Item>;
    direction: 'horizontal' | 'vertical';
    scrollKey: 'scrollTop' | 'scrollLeft';
    dimensionKey: 'height' | 'width';
    paddingKeys: PaddingMap;
};
export type DragTarget = {
    key?: string;
    item: Item;
    controllingDropZoneId: number;
    sourceRect: Rect;
    dragElement: HTMLDivElement;
    cachedRect: Rect;
    lastPosition: Position;
    cursor: 'grabbing' | 'not-allowed';
};
export type DragDropSettings = {
    defaults: {
        disableScrollOnDrag: boolean;
        disableDropSpacing: boolean;
        disableSourceShrinking: boolean;
        enableResizeListeners: boolean;
        crossingMode: 'center' | 'edge';
        direction: 'horizontal' | 'vertical';
    };
    globals: {
        dragThresholdPixels: number;
        animationMs: number;
        scrollOnDragThresholdPercent: number;
        scrollOnDragMinPixels: number;
        scrollOnDragMaxPixels: number;
        minDragScrollSpeed: number;
        maxDragScrollSpeed: number;
    };
};
export type DropGroup = {
    key: string;
    onDragStart: (item: Item, dropZone: Id) => void;
    onDropIn: (
        item: Item,
        index: number,
        insertedAfter: Item | undefined,
        listSnapshot: Item[],
        sourceDropZone: Id,
        destinationDropZone: Id
    ) => void;
    onDragOut: (item: Item, listSnapshot: Item[], sourceDropZone: Id) => void;
    onDragCancel: (item: Item, dropZone: Id) => void;
};

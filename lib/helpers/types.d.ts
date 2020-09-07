export declare type Id = number | string;
export declare type Placement = 'before' | 'after';
export declare type Direction = 'horizontal' | 'vertical';
export declare type Item = {
    id: Id;
};
export declare type DragEventHandlers = {
    handleMouseDown: (event: MouseEvent, itemId: Id) => void;
    handleMouseUp: (event: MouseEvent) => void;
    handleMouseMove: (event: MouseEvent) => void;
};
export declare type HoverResult = {
    index: number;
    item: Item;
    element: HTMLDivElement;
    placement: Placement;
};
export declare type DropCallback = (dragTarget: HoverResult | undefined) => void;
export declare type HoverCallback = () => HoverResult | undefined;
export declare type Position = {
    x: number;
    y: number;
};
export declare type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare type DropTarget = {
    id: number;
    key?: string;
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
};
export declare type DropTargetCache = {
    items: Array<Item>;
    direction: 'horizontal' | 'vertical';
    scrollKey: 'scrollTop' | 'scrollLeft';
    dimensionKey: 'height' | 'width';
    paddingKeys: {
        before: 'paddingTop';
        after: 'paddingBottom';
    } | {
        before: 'paddingLeft';
        after: 'paddingRight';
    };
};
export declare type DragTarget = {
    key?: string;
    item: Item;
    controllingDropZoneId: number;
    sourceRect: Rect;
    dragElement: HTMLDivElement;
    cachedRect: Rect;
};
export declare type DragDropSettings = {
    defaults: {
        disableScrollOnDrag: boolean;
        disableDropSpacing: boolean;
        enableResizeListeners: boolean;
        direction: 'horizontal' | 'vertical';
    };
    dragThresholdPixels: number;
    animationMs: number;
    scrollOnDragThresholdPercent: number;
    scrollOnDragMinPixels: number;
    scrollOnDragMaxPixels: number;
    minDragScrollSpeed: number;
    maxDragScrollSpeed: number;
};
export declare type DropGroup = {
    key: string;
    onDragStart: () => void;
    onDropIn: (item: Item, index: number, insertedAfter: Item | undefined, listSnapshot: Item[], sourceDropZoneId: number, destinationDropZoneId: number) => void;
    onDragOut: (item: Item, listSnapshot: Item[], sourceDropZoneId: number) => void;
    onDragCancel: (item: Item) => void;
};

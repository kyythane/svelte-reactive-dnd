import type { Rect, HoverResult, Position, Id, Placement } from './types';
export declare function makeDraggableElement(originalElement: HTMLDivElement, id: Id): HTMLDivElement;
export declare function overlap(rect1: Rect, rect2: Rect): boolean;
export declare function percentOverlap(rect1: Rect, rect2: Rect): {
    overlapX: number;
    overlapY: number;
};
export declare function computeMidpoint(rect: Rect): Position;
export declare function removePaddingFromRect(element: HTMLElement, rect: Rect): Rect;
export declare function pixelStringToNumber(pixelString: string): number;
export declare function removePaddingFromHoverResult(result: HoverResult): void;
export declare function updateContainingStyleSize(containingElement: HTMLDivElement, direction: 'horizontal' | 'vertical', amount: number): void;
export declare function calculatePlacement(rectA: Rect, rectB: Rect, direction: 'horizontal' | 'vertical'): Placement;
export declare function growOrShrinkRectInList(rects: Array<Rect>, startIndex: number, offset: Position): Array<Rect>;
export declare function translateRectsBy(rects: Array<Rect>, startIndex: number, offset: Position): Array<Rect>;
export declare function moveRectTo({ width, height }: Rect, { x, y }: Position): Rect;
export declare function clamp(num: number, min?: number, max?: number): number;
export declare function lerp(percent: number, min: number, max: number): number;

import { Writable } from 'svelte/store';
import type {
    DragDropSettings,
    DropTarget,
    DragTarget,
    DropTargetCache,
} from './types';
export declare const dragDropSettings: Writable<DragDropSettings>;
export declare const dropTargets: Writable<Array<DropTarget>>;
export declare const dragging: Writable<
    'none' | 'picking-up' | 'dragging' | 'returning' | 'dropping'
>;
export declare const dragTarget: Writable<DragTarget | undefined>;
export declare function createDropTargetCache(
    initialState: Pick<DropTargetCache, 'items' | 'direction'>
): {
    subscribe: (
        run: (value: {
            scrollKey: string;
            dimensionKey: string;
            paddingKeys: {
                before: string;
                after: string;
            };
            items: import('./types').Item[];
            direction: 'horizontal' | 'vertical';
        }) => void,
        invalidate?: (value?: {
            scrollKey: string;
            dimensionKey: string;
            paddingKeys: {
                before: string;
                after: string;
            };
            items: import('./types').Item[];
            direction: 'horizontal' | 'vertical';
        }) => void
    ) => () => void;
    set: ({
        items,
        direction,
    }: Pick<DropTargetCache, 'items' | 'direction'>) => void;
};
export declare const dropTargetId: {
    subscribe: (
        run: (value: number) => void,
        invalidate?: (value?: number) => void
    ) => () => void;
    next: () => number;
};
export declare const dropGroupId: {
    subscribe: (
        run: (value: number) => void,
        invalidate?: (value?: number) => void
    ) => () => void;
    next: () => number;
};

import { writable, Writable, Readable } from 'svelte/store';
import type {
    DragDropSettings,
    DropTarget,
    DragTarget,
    DropTargetCache,
    Direction,
} from './types';

export const dragDropSettings: Writable<DragDropSettings> = writable({
    defaults: {
        disableScrollOnDrag: false,
        disableDropSpacing: false,
        enableResizeListeners: false,
        direction: 'vertical',
    },
    dragThresholdPixels: 25,
    animationMs: 200,
    scrollOnDragThresholdPercent: 0.1,
    scrollOnDragMinPixels: 50,
    scrollOnDragMaxPixels: 150,
    minDragScrollSpeed: 75,
    maxDragScrollSpeed: 175,
});
export const dropTargets: Writable<Array<DropTarget>> = writable([]);
export const dragging: Writable<
    'none' | 'picking-up' | 'dragging' | 'returning' | 'dropping'
> = writable('none');
export const dragTarget: Writable<DragTarget | undefined> = writable(undefined);

function getKeysForDirection(
    direction: Direction
): Pick<DropTargetCache, 'scrollKey' | 'dimensionKey' | 'paddingKeys'> {
    return {
        scrollKey: direction === 'vertical' ? 'scrollTop' : 'scrollLeft',
        dimensionKey: direction === 'vertical' ? 'height' : 'width',
        paddingKeys:
            direction === 'vertical'
                ? { before: 'paddingTop', after: 'paddingBottom' }
                : { before: 'paddingLeft', after: 'paddingRight' },
    };
}

export interface DropTargetCacheStore extends Readable<DropTargetCache> {
    set: ({
        items,
        direction,
    }: Pick<DropTargetCache, 'items' | 'direction'>) => void;
}

export function createDropTargetCache(
    initialState: Pick<DropTargetCache, 'items' | 'direction'>
): DropTargetCacheStore {
    const { subscribe, set } = writable({
        ...initialState,
        ...getKeysForDirection(initialState.direction),
    });
    return {
        subscribe,
        set: ({
            items,
            direction,
        }: Pick<DropTargetCache, 'items' | 'direction'>) => {
            set({
                items,
                direction,
                ...getKeysForDirection(initialState.direction),
            });
        },
    };
}

function createAutoIncrementingId() {
    const { subscribe, update } = writable(0);
    return {
        subscribe,
        next: () => {
            let curr = 0;
            update((n) => {
                curr = n;
                return n + 1;
            });
            return curr;
        },
    };
}
export const dropTargetId = createAutoIncrementingId();
export const dropGroupId = createAutoIncrementingId();

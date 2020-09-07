import { writable } from 'svelte/store';
export const dragDropSettings = writable({
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
export const dropTargets = writable([]);
export const dragging = writable('none');
export const dragTarget = writable(undefined);
function getKeysForDirection(direction) {
    return {
        scrollKey: direction === 'vertical' ? 'scrollTop' : 'scrollLeft',
        dimensionKey: direction === 'vertical' ? 'height' : 'width',
        paddingKeys: direction === 'vertical'
            ? { before: 'paddingTop', after: 'paddingBottom' }
            : { before: 'paddingLeft', after: 'paddingRight' },
    };
}
export function createDropTargetCache(initialState) {
    const { subscribe, set } = writable(Object.assign(Object.assign({}, initialState), getKeysForDirection(initialState.direction)));
    return {
        subscribe,
        set: ({ items, direction, }) => {
            set(Object.assign({ items,
                direction }, getKeysForDirection(initialState.direction)));
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
//# sourceMappingURL=stores.js.map
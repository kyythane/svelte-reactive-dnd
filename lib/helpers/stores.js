var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { writable } from 'svelte/store';
export var dragDropSettings = writable({
    defaults: {
        disableScrollOnDrag: false,
        disableDropSpacing: false,
        enableResizeListeners: false,
        direction: 'vertical'
    },
    dragThresholdPixels: 25,
    animationMs: 200,
    scrollOnDragThresholdPercent: 0.1,
    scrollOnDragMinPixels: 50,
    scrollOnDragMaxPixels: 150,
    minDragScrollSpeed: 75,
    maxDragScrollSpeed: 175
});
export var dropTargets = writable([]);
export var dragging = writable('none');
export var dragTarget = writable(undefined);
function getKeysForDirection(direction) {
    return {
        scrollKey: direction === 'vertical' ? 'scrollTop' : 'scrollLeft',
        dimensionKey: direction === 'vertical' ? 'height' : 'width',
        paddingKeys: direction === 'vertical'
            ? { before: 'paddingTop', after: 'paddingBottom' }
            : { before: 'paddingLeft', after: 'paddingRight' }
    };
}
export function createDropTargetCache(initialState) {
    var _a = writable(__assign(__assign({}, initialState), getKeysForDirection(initialState.direction))), subscribe = _a.subscribe, set = _a.set;
    return {
        subscribe: subscribe,
        set: function (_a) {
            var items = _a.items, direction = _a.direction;
            set(__assign({ items: items,
                direction: direction }, getKeysForDirection(initialState.direction)));
        }
    };
}
function createAutoIncrementingId() {
    var _a = writable(0), subscribe = _a.subscribe, update = _a.update;
    return {
        subscribe: subscribe,
        next: function () {
            var curr = 0;
            update(function (n) {
                curr = n;
                return n + 1;
            });
            return curr;
        }
    };
}
export var dropTargetId = createAutoIncrementingId();
export var dropGroupId = createAutoIncrementingId();

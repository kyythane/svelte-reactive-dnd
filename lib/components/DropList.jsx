var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
///<reference types="svelte" />
<></>;
import { onMount, tick, onDestroy, createEventDispatcher, getContext, } from 'svelte';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { computeMidpoint, makeDraggableElement, calculatePlacement, overlap, percentOverlap, removePaddingFromRect, removePaddingFromHoverResult, updateContainingStyleSize, moveRectTo, pixelStringToNumber, growOrShrinkRectInList, translateRectsBy, lerp, } from '../helpers/utilities';
import { dragging, dropTargets, dragTarget, dropTargetId, dragDropSettings, createDropTargetCache, } from '../helpers/stores';
function render() {
    var _this = this;
    var items;
    var key = undefined;
    key = __sveltets_any(key);
    ;
    var capacity = Number.POSITIVE_INFINITY;
    var disabled = false;
    disabled = __sveltets_any(disabled);
    ;
    var disableScrollOnDrag = __sveltets_store_get(dragDropSettings).defaults.disableScrollOnDrag;
    disableScrollOnDrag = __sveltets_any(disableScrollOnDrag);
    ;
    var disableDropSpacing = __sveltets_store_get(dragDropSettings).defaults.disableDropSpacing;
    disableDropSpacing = __sveltets_any(disableDropSpacing);
    ;
    var enableResizeListeners = __sveltets_store_get(dragDropSettings).defaults.enableResizeListeners;
    enableResizeListeners = __sveltets_any(enableResizeListeners);
    ;
    var direction = __sveltets_store_get(dragDropSettings).defaults.direction;
    direction = __sveltets_any(direction);
    ;
    var allowDrop = function () { return true; };
    allowDrop = __sveltets_any(allowDrop);
    ;
    var id = dropTargetId.next();
    var dropGroup = getContext('reactive-drop-group');
    var cache = createDropTargetCache({
        items: [],
        direction: direction
    });
    var cachedRects = [];
    var cachedDropZoneRect;
    var cachedDisplay;
    var wrappingElements = {};
    var dropZone;
    var currentWidth = 0;
    var currentHeight = 0;
    var mounted = false;
    var potentiallDraggedId = undefined;
    var currentlyDraggingOver = undefined;
    var previouslyDraggedOver = [];
    var draggableDragStart = undefined;
    var handleDelayedEvent;
    // Tweened isn't exported, so use Writable since it is _mostly_ correct
    var dragTween = undefined;
    var sourceElementTween = undefined;
    var hoverEnterElementTween = undefined;
    var hoverLeaveElementTweens = undefined;
    var dragScrollTween = undefined;
    var dragScrollTarget;
    var dragScrollCurrent;
    var currentDropTarget = undefined;
    var hierarchyKey = key !== null && key !== void 0 ? key : dropGroup === null || dropGroup === void 0 ? void 0 : dropGroup.key;
    var active = false;
    ;
    (function () {
        $: {
            hierarchyKey = key !== null && key !== void 0 ? key : dropGroup === null || dropGroup === void 0 ? void 0 : dropGroup.key;
        }
    });
    var dispatch = createEventDispatcher();
    var moveDraggable = function (event) {
        var _a;
        if (((_a = __sveltets_store_get(dragTarget)) === null || _a === void 0 ? void 0 : _a.controllingDropZoneId) === id &&
            (__sveltets_store_get(dragging) === 'picking-up' || __sveltets_store_get(dragging) === 'dragging')) {
            event.preventDefault();
            dragTween.set({
                x: event.clientX - draggableDragStart.x,
                y: event.clientY - draggableDragStart.y
            });
        }
    };
    var cleanupAfterDrag = function () {
        dragging.set('none');
        document.body.removeChild(__sveltets_store_get(dragTarget).dragElement);
        var containingElement = wrappingElements[__sveltets_store_get(dragTarget).item.id];
        containingElement.style[__sveltets_store_get(cache).dimensionKey] = '';
        containingElement.style.paddingTop = '';
        containingElement.style.paddingBottom = '';
        containingElement.style.paddingLeft = '';
        containingElement.style.paddingRight = '';
        containingElement
            .children[0].style.display = cachedDisplay;
        if (!!currentlyDraggingOver &&
            currentlyDraggingOver.item.id === __sveltets_store_get(dragTarget).item.id) {
            currentlyDraggingOver = undefined;
            hoverEnterElementTween = undefined;
        }
        __sveltets_store_get(dropTargets)
            .filter(function (target) { return target.key === hierarchyKey; })
            .forEach(function (target) { return target.cleanupDropZone(); });
        dragTarget.set(undefined);
    };
    var cleanupDropZone = function () {
        if (!!currentlyDraggingOver) {
            startDragOff();
        }
        cachedRects = [];
        draggableDragStart = undefined;
        cachedDisplay = undefined;
        currentDropTarget = undefined;
        dragScrollTween = undefined;
        active = false;
    };
    var endDrag = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var hoverResult, offset, boundingRect, strippedRect, position, dragOutResult;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(((_a = __sveltets_store_get(dragTarget)) === null || _a === void 0 ? void 0 : _a.controllingDropZoneId) === id &&
                        (__sveltets_store_get(dragging) === 'picking-up' || __sveltets_store_get(dragging) === 'dragging'))) return [3 /*break*/, 4];
                    event.preventDefault();
                    if (!!!currentDropTarget) return [3 /*break*/, 2];
                    hoverResult = currentDropTarget.dropTarget.hoverCallback() ||
                        currentDropTarget.hoverResult;
                    dragging.set('dropping');
                    offset = void 0;
                    // go go gadget structural typing
                    if (!!hoverResult) {
                        boundingRect = hoverResult.element.getBoundingClientRect();
                        if (hoverResult.placement === 'before') {
                            offset = boundingRect;
                        }
                        else {
                            strippedRect = removePaddingFromRect(hoverResult.element, boundingRect);
                            if (direction === 'horizontal') {
                                offset = {
                                    x: boundingRect.x + strippedRect.width,
                                    y: boundingRect.y
                                };
                            }
                            else {
                                offset = {
                                    x: boundingRect.x,
                                    y: boundingRect.y + strippedRect.height
                                };
                            }
                        }
                    }
                    else {
                        offset = currentDropTarget.dropTarget.rect;
                    }
                    position = {
                        x: offset.x - __sveltets_store_get(dragTarget).sourceRect.x,
                        y: offset.y - __sveltets_store_get(dragTarget).sourceRect.y
                    };
                    // Tweened .set returns a promise that resolves, but our types don't show that
                    return [4 /*yield*/, dragTween.set(position)];
                case 1:
                    // Tweened .set returns a promise that resolves, but our types don't show that
                    _b.sent();
                    currentDropTarget.dropTarget.dropCallback(hoverResult);
                    // We only send drop events when reordering a list, since the element never really left
                    if (currentDropTarget.dropTarget.id !== id) {
                        dragOutResult = {
                            item: __sveltets_store_get(dragTarget).item,
                            listSnapshot: __spreadArrays(__sveltets_store_get(cache).items.filter(function (cachedItem) {
                                return cachedItem.id !== __sveltets_store_get(dragTarget).item.id;
                            })),
                            destinationDropZone: currentDropTarget.dropTarget.id
                        };
                        if (!!dropGroup && dropGroup.key === hierarchyKey) {
                            dropGroup.onDragOut(dragOutResult.item, dragOutResult.listSnapshot, id);
                        }
                        dispatch('itemdraggedout', dragOutResult);
                    }
                    cleanupAfterDrag();
                    return [3 /*break*/, 4];
                case 2:
                    dragging.set('returning');
                    sourceElementTween.set(__sveltets_store_get(dragTarget).sourceRect[__sveltets_store_get(cache).dimensionKey]);
                    if (!!currentlyDraggingOver) {
                        startDragOff();
                    }
                    // Tweened .set returns a promise that resolves, but our types don't show that
                    return [4 /*yield*/, dragTween.set({ x: 0, y: 0 })];
                case 3:
                    // Tweened .set returns a promise that resolves, but our types don't show that
                    _b.sent();
                    if (!!dropGroup && dropGroup.key === hierarchyKey) {
                        dropGroup.onDragCancel(__sveltets_store_get(dragTarget).item);
                    }
                    dispatch('dragcancelled', {
                        item: __sveltets_store_get(dragTarget).item
                    });
                    cleanupAfterDrag();
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDraggableMouseDown = function (event, id, delayedEvent) {
        if (!disabled &&
            !!__sveltets_store_get(cache).items.find(function (c) { return c.id === id; }) &&
            event.button === 0) {
            draggableDragStart = { x: event.clientX, y: event.clientY };
            potentiallDraggedId = id;
            if (!!delayedEvent) {
                handleDelayedEvent = function () {
                    delayedEvent(event);
                };
            }
        }
        else if (!!delayedEvent) {
            delayedEvent(event);
        }
    };
    var handleDraggableMouseUp = function () {
        if (__sveltets_store_get(dragging) === 'none') {
            if (handleDelayedEvent) {
                handleDelayedEvent();
            }
            draggableDragStart = undefined;
            potentiallDraggedId = undefined;
            handleDelayedEvent = undefined;
        }
    };
    var handleDraggableMouseMove = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var dx, dy, containingElement, cloned, child;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(!!draggableDragStart && __sveltets_store_get(dragging) === 'none')) return [3 /*break*/, 2];
                    dx = draggableDragStart.x - event.clientX;
                    dy = draggableDragStart.y - event.clientY;
                    if (!(dx * dx + dy * dy > __sveltets_store_get(dragDropSettings).dragThresholdPixels)) return [3 /*break*/, 2];
                    dragging.set('picking-up');
                    containingElement = wrappingElements[potentiallDraggedId];
                    cloned = makeDraggableElement(containingElement, potentiallDraggedId);
                    document.body.append(cloned);
                    dragTarget.set({
                        item: __sveltets_store_get(cache).items.find(function (c) { return c.id === potentiallDraggedId; }),
                        key: hierarchyKey,
                        controllingDropZoneId: id,
                        dragElement: cloned,
                        sourceRect: containingElement.getBoundingClientRect(),
                        cachedRect: cloned.getBoundingClientRect()
                    });
                    dragTween = tweened({ x: 0, y: 0 }, {
                        duration: __sveltets_store_get(dragDropSettings).animationMs,
                        easing: cubicOut
                    });
                    sourceElementTween = tweened(__sveltets_store_get(dragTarget).sourceRect[__sveltets_store_get(cache).dimensionKey], {
                        duration: __sveltets_store_get(dragDropSettings).animationMs,
                        easing: cubicOut
                    });
                    updateContainingStyleSize(containingElement, __sveltets_store_get(cache).direction, __sveltets_store_get(dragTarget).sourceRect[__sveltets_store_get(cache).dimensionKey]);
                    child = containingElement.children[0];
                    cachedDisplay = child.style.display;
                    child.style.display = 'none';
                    active = true;
                    __sveltets_store_get(dropTargets)
                        .filter(function (target) { return target.key === hierarchyKey; })
                        .forEach(function (target) { return target.prepareDropZone(); });
                    if (!!dropGroup && dropGroup.key === hierarchyKey) {
                        dropGroup.onDragStart();
                    }
                    // Tweened .set returns a promise that resolves, but our types don't show that
                    return [4 /*yield*/, sourceElementTween.set(0)];
                case 1:
                    // Tweened .set returns a promise that resolves, but our types don't show that
                    _a.sent();
                    dragging.set('dragging');
                    cachedRects = [];
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var prepareDropZone = function () {
        dragScrollCurrent = dropZone[__sveltets_store_get(cache).scrollKey];
        dragScrollTarget = dragScrollCurrent;
        potentiallDraggedId = undefined;
        handleDelayedEvent = undefined;
        currentlyDraggingOver = undefined;
        currentDropTarget = undefined;
        previouslyDraggedOver = [];
    };
    var dropCallback = function (drop) {
        var dropIndex;
        if (!!drop) {
            if (drop.placement === 'before') {
                dropIndex = drop.index;
            }
            else {
                dropIndex = drop.index + 1;
            }
        }
        else {
            dropIndex = 0;
        }
        // Always filter because it isn't that expensive and it avoids special casing dropping back in the same list (as much as possible)
        var firstSection = __sveltets_store_get(cache).items
            .slice(0, dropIndex)
            .filter(function (cachedItem) { return cachedItem.id !== __sveltets_store_get(dragTarget).item.id; });
        var secondSection = __sveltets_store_get(cache).items
            .slice(dropIndex)
            .filter(function (cachedItem) { return cachedItem.id !== __sveltets_store_get(dragTarget).item.id; });
        var listSnapshot = __spreadArrays(firstSection, [
            __sveltets_store_get(dragTarget).item
        ], secondSection);
        var finalIndex = listSnapshot.findIndex(function (snapshotItem) { return snapshotItem.id === __sveltets_store_get(dragTarget).item.id; });
        if (!!currentlyDraggingOver) {
            removePaddingFromHoverResult(currentlyDraggingOver);
            currentlyDraggingOver = undefined;
            hoverEnterElementTween = undefined;
        }
        var dropInResult = {
            item: __sveltets_store_get(dragTarget).item,
            index: finalIndex,
            insertedAfter: finalIndex > 0 ? __sveltets_store_get(cache).items[finalIndex - 1] : undefined,
            listSnapshot: listSnapshot,
            sourceDropZone: __sveltets_store_get(dragTarget).controllingDropZoneId
        };
        if (!!dropGroup && dropGroup.key === hierarchyKey) {
            dropGroup.onDropIn(dropInResult.item, dropInResult.index, dropInResult.insertedAfter, dropInResult.listSnapshot, dropInResult.sourceDropZone, id);
        }
        dispatch('itemdroppedin', dropInResult);
    };
    var startDragOver = function (hoverResult) {
        if (disableDropSpacing) {
            return;
        }
        var draggedOffIndex = previouslyDraggedOver.findIndex(function (previous) {
            return previous.item.id === hoverResult.item.id &&
                previous.placement === hoverResult.placement;
        });
        var startingSize = 0;
        if (draggedOffIndex > -1) {
            previouslyDraggedOver = previouslyDraggedOver.filter(function (_, index) { return index !== draggedOffIndex; });
            var sizes = __sveltets_store_get(hoverLeaveElementTweens);
            startingSize = Math.min(sizes[draggedOffIndex], __sveltets_store_get(dragTarget).cachedRect[__sveltets_store_get(cache).dimensionKey]);
            var filteredSizes = sizes.filter(function (_, index) { return index !== draggedOffIndex; });
            hoverLeaveElementTweens = tweened(filteredSizes, {
                duration: __sveltets_store_get(dragDropSettings).animationMs,
                easing: cubicOut
            });
            hoverLeaveElementTweens.set(new Array(filteredSizes.length).fill(0));
        }
        currentlyDraggingOver = hoverResult;
        hoverEnterElementTween = tweened(startingSize, {
            duration: __sveltets_store_get(dragDropSettings).animationMs,
            easing: cubicOut
        });
        hoverEnterElementTween.set(__sveltets_store_get(dragTarget).cachedRect[__sveltets_store_get(cache).dimensionKey]);
    };
    var startDragOff = function () {
        if (!currentlyDraggingOver) {
            return;
        }
        var indexOfCurrent = previouslyDraggedOver.findIndex(function (prev) {
            return prev.item.id === currentlyDraggingOver.item.id &&
                prev.placement === currentlyDraggingOver.placement;
        });
        var previousTweenValues = !!hoverLeaveElementTweens
            ? __sveltets_store_get(hoverLeaveElementTweens)
            : [];
        if (indexOfCurrent >= 0) {
            previouslyDraggedOver = previouslyDraggedOver.filter(function (_, index) { return index !== indexOfCurrent; });
            previousTweenValues = previousTweenValues.filter(function (_, index) { return index !== indexOfCurrent; });
        }
        previouslyDraggedOver = __spreadArrays(previouslyDraggedOver, [
            currentlyDraggingOver,
        ]);
        hoverLeaveElementTweens = tweened(__spreadArrays(previousTweenValues, [
            Math.min(__sveltets_store_get(hoverEnterElementTween), __sveltets_store_get(dragTarget).cachedRect[__sveltets_store_get(cache).dimensionKey]),
        ]), {
            duration: __sveltets_store_get(dragDropSettings).animationMs,
            easing: cubicOut
        });
        hoverLeaveElementTweens.set(new Array(previousTweenValues.length + 1).fill(0));
        hoverEnterElementTween = undefined;
        currentlyDraggingOver = undefined;
    };
    var checkScroll = function () {
        if (disableScrollOnDrag) {
            dragScrollTween = undefined;
            dragScrollTarget = dragScrollCurrent;
            return;
        }
        var midpoint = __sveltets_store_get(cache).direction === 'horizontal'
            ? computeMidpoint(__sveltets_store_get(dragTarget).cachedRect).x
            : computeMidpoint(__sveltets_store_get(dragTarget).cachedRect).y;
        var compOffset = __sveltets_store_get(cache).direction === 'horizontal'
            ? cachedDropZoneRect.x
            : cachedDropZoneRect.y;
        var threshold = Math.min(Math.max(__sveltets_store_get(dragDropSettings).scrollOnDragThresholdPercent *
            cachedDropZoneRect[__sveltets_store_get(cache).dimensionKey], __sveltets_store_get(dragDropSettings).scrollOnDragMinPixels), __sveltets_store_get(dragDropSettings).scrollOnDragMaxPixels);
        if (midpoint <= threshold + compOffset) {
            var ratio = 1 - (midpoint - compOffset) / threshold;
            if (dragScrollTarget >= dragScrollCurrent) {
                dragScrollTween = tweened(dragScrollCurrent, {
                    duration: __sveltets_store_get(dragDropSettings).animationMs
                });
                /* Use truncation rather than floor because it is more consistent
               Math.trunc(1.1) === 1, Math.trunc(-1.1) === -1 */
                dragScrollTarget = Math.trunc(dragScrollCurrent -
                    lerp(ratio, __sveltets_store_get(dragDropSettings).minDragScrollSpeed, __sveltets_store_get(dragDropSettings).maxDragScrollSpeed));
                dragScrollTween.set(dragScrollTarget);
            }
        }
        else if (midpoint >=
            cachedDropZoneRect[__sveltets_store_get(cache).dimensionKey] - threshold + compOffset) {
            var ratio = (midpoint -
                (cachedDropZoneRect[__sveltets_store_get(cache).dimensionKey] -
                    threshold +
                    compOffset)) /
                threshold;
            if (dragScrollTarget <= dragScrollCurrent) {
                dragScrollTween = tweened(dragScrollCurrent, {
                    duration: __sveltets_store_get(dragDropSettings).animationMs
                });
                dragScrollTarget = Math.trunc(dragScrollCurrent +
                    lerp(ratio, __sveltets_store_get(dragDropSettings).minDragScrollSpeed, __sveltets_store_get(dragDropSettings).maxDragScrollSpeed));
                dragScrollTween.set(dragScrollTarget);
            }
        }
        else {
            dragScrollTween = undefined;
            dragScrollTarget = dragScrollCurrent;
        }
    };
    var hoverCallback = function () {
        if (__sveltets_store_get(cache).items.length === 0) {
            return undefined;
        }
        checkScroll();
        var overlapped = false;
        var overlapping = [];
        for (var index = 0; index < __sveltets_store_get(cache).items.length; index++) {
            var cachedItem = __sveltets_store_get(cache).items[index];
            var element = wrappingElements[cachedItem.id];
            if (index >= cachedRects.length ||
                cachedRects[index] === undefined) {
                cachedRects[index] = element.getBoundingClientRect();
            }
            var overlaps = overlap(__sveltets_store_get(dragTarget).cachedRect, cachedRects[index]);
            var rectWithoutPadding = removePaddingFromRect(element, cachedRects[index]);
            var placement = calculatePlacement(rectWithoutPadding, __sveltets_store_get(dragTarget).cachedRect, __sveltets_store_get(cache).direction);
            if (overlaps) {
                overlapping.push({
                    index: index,
                    item: cachedItem,
                    element: element,
                    placement: placement
                });
                overlapped = true;
            }
            else if (overlapped) {
                break;
            }
        }
        // Since cachedItems must be non-empty. If nothing overlaps, we are past the end of the list.
        if (overlapping.length === 0) {
            var lastIndex = __sveltets_store_get(cache).items.length - 1;
            var lastItem = __sveltets_store_get(cache).items[lastIndex];
            overlapping.push({
                index: lastIndex,
                item: lastItem,
                element: wrappingElements[lastItem.id],
                placement: 'after'
            });
        }
        var midpoint = Math.trunc((overlapping[0].index + overlapping[overlapping.length - 1].index) /
            2);
        var overlappedItem = overlapping.find(function (o) { return o.index === midpoint; });
        /* Only use 'before' placement at the start of the list. Since we are changing padding,
     we want to reduce the chance of weird interactions with wrapping.
     */
        if (overlappedItem.placement === 'before' && overlappedItem.index > 0) {
            var indexBefore = overlappedItem.index - 1;
            var itemBefore = __sveltets_store_get(cache).items[indexBefore];
            overlappedItem = {
                index: indexBefore,
                item: itemBefore,
                element: wrappingElements[itemBefore.id],
                placement: 'after'
            };
        }
        if (!currentlyDraggingOver) {
            startDragOver(overlappedItem);
        }
        else if (currentlyDraggingOver.item.id !== overlappedItem.item.id ||
            currentlyDraggingOver.placement !== overlappedItem.placement) {
            startDragOff();
            startDragOver(overlappedItem);
        }
        return overlappedItem;
    };
    var enterDropZone = function () {
        active = true;
        dispatch('dropzoneenter', {
            item: __sveltets_store_get(dragTarget).item,
            rect: __sveltets_store_get(dragTarget).cachedRect
        });
    };
    var leaveDropZone = function () {
        active = false;
        if (!!currentlyDraggingOver) {
            startDragOff();
        }
        dragScrollTarget = dragScrollCurrent;
        dragScrollTween = undefined;
        dispatch('dropzoneleave', {
            item: __sveltets_store_get(dragTarget).item,
            rect: __sveltets_store_get(dragTarget).cachedRect
        });
    };
    // Update the dropTarget for this dropZone
    ;
    (function () {
        $: {
            if (mounted) {
                var updatedRect = false;
                var updatedCapacity = false;
                var updatedDisabled = false;
                if (enableResizeListeners &&
                    ((cachedDropZoneRect === null || cachedDropZoneRect === void 0 ? void 0 : cachedDropZoneRect.width) !== currentWidth ||
                        (cachedDropZoneRect === null || cachedDropZoneRect === void 0 ? void 0 : cachedDropZoneRect.height) !== currentHeight)) {
                    var bounding = dropZone.getBoundingClientRect();
                    cachedDropZoneRect = {
                        x: bounding.left,
                        y: bounding.top,
                        width: currentWidth,
                        height: currentHeight
                    };
                    updatedRect = true;
                }
                if (updatedRect || updatedCapacity || updatedDisabled) {
                    dropTargets.set(__spreadArrays(__sveltets_store_get(dropTargets).filter(function (dt) { return dt.id !== id; }), [
                        {
                            id: id,
                            key: hierarchyKey,
                            rect: cachedDropZoneRect,
                            dropElement: dropZone,
                            dropCallback: dropCallback,
                            hoverCallback: hoverCallback,
                            prepareDropZone: prepareDropZone,
                            enterDropZone: enterDropZone,
                            leaveDropZone: leaveDropZone,
                            hasItem: hasItem,
                            getEventHandlers: getEventHandlers,
                            cleanupDropZone: cleanupDropZone,
                            canDrop: canDrop
                        },
                    ]));
                }
            }
        }
    });
    (function () {
        $: {
            if (__sveltets_store_get(dragging) === 'none' || hierarchyKey !== __sveltets_store_get(dragTarget).key) {
                cache.set({
                    items: items,
                    direction: direction
                });
            }
        }
    });
    (function () {
        var _a;
        $: {
            if (((_a = __sveltets_store_get(dragTarget)) === null || _a === void 0 ? void 0 : _a.controllingDropZoneId) === id &&
                (__sveltets_store_get(dragging) === 'picking-up' || __sveltets_store_get(dragging) === 'returning')) {
                updateContainingStyleSize(wrappingElements[__sveltets_store_get(dragTarget).item.id], __sveltets_store_get(cache).direction, __sveltets_store_get(sourceElementTween));
            }
        }
    });
    (function () {
        $: {
            if (!!currentlyDraggingOver && !!hoverEnterElementTween) {
                var offset = __sveltets_store_get(hoverEnterElementTween);
                var lastOffset = pixelStringToNumber(currentlyDraggingOver.element.style[__sveltets_store_get(cache).paddingKeys[currentlyDraggingOver.placement]]);
                currentlyDraggingOver.element.style[__sveltets_store_get(cache).paddingKeys[currentlyDraggingOver.placement]] = offset + "px";
                var delta = offset - lastOffset;
                var offsetPosition = __sveltets_store_get(cache).direction === 'horizontal'
                    ? { x: delta, y: 0 }
                    : { x: 0, y: delta };
                if (cachedRects.length >= currentlyDraggingOver.index) {
                    cachedRects = growOrShrinkRectInList(cachedRects, currentlyDraggingOver.index, offsetPosition);
                }
            }
        }
    });
    (function () {
        $: {
            if (previouslyDraggedOver.length > 0 && !!hoverLeaveElementTweens) {
                var sizes_1 = __sveltets_store_get(hoverLeaveElementTweens);
                var deltas_1 = [];
                var previousSizes_1 = previouslyDraggedOver.map(function (target) {
                    return pixelStringToNumber(target.element.style[__sveltets_store_get(cache).paddingKeys[target.placement]]);
                });
                previouslyDraggedOver = previouslyDraggedOver.map(function (target, index) {
                    var delta = sizes_1[index] - previousSizes_1[index];
                    deltas_1.push({ index: target.index, delta: delta });
                    target.element.style[__sveltets_store_get(cache).paddingKeys[target.placement]] = sizes_1[index] + "px";
                    return target;
                });
                var zeros = 0;
                for (var i = 0; i < sizes_1.length; i++) {
                    if (sizes_1[i] > 0) {
                        break;
                    }
                    ++zeros;
                }
                if (zeros > 0) {
                    previouslyDraggedOver = previouslyDraggedOver.slice(zeros);
                    hoverLeaveElementTweens = tweened(sizes_1.slice(zeros), {
                        duration: __sveltets_store_get(dragDropSettings).animationMs,
                        easing: cubicOut
                    });
                    hoverLeaveElementTweens.set(new Array(previouslyDraggedOver.length).fill(0));
                }
                deltas_1.forEach(function (_a) {
                    var index = _a.index, delta = _a.delta;
                    if (cachedRects.length >= index) {
                        var offsetPosition = __sveltets_store_get(cache).direction === 'horizontal'
                            ? { x: delta, y: 0 }
                            : { x: 0, y: delta };
                        cachedRects = growOrShrinkRectInList(cachedRects, index, offsetPosition);
                    }
                });
            }
        }
    });
    var hasItem = function (itemId) {
        return !!__sveltets_store_get(cache).items.find(function (c) { return c.id === itemId; });
    };
    var getEventHandlers = function () {
        return {
            handleMouseDown: handleDraggableMouseDown,
            handleMouseUp: handleDraggableMouseUp,
            handleMouseMove: handleDraggableMouseMove
        };
    };
    var canDrop = function () {
        return (!disabled &&
            __sveltets_store_get(dragTarget).key === hierarchyKey &&
            capacity - __sveltets_store_get(cache).items.length > 0 &&
            allowDrop(__sveltets_store_get(dragTarget).item, __sveltets_store_get(dragTarget).controllingDropZoneId));
    };
    var postScrollUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
        var previous, delta, offsetPosition;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    previous = dragScrollCurrent;
                    return [4 /*yield*/, tick()];
                case 1:
                    _a.sent();
                    dragScrollCurrent = dropZone[__sveltets_store_get(cache).scrollKey];
                    delta = dragScrollCurrent - previous;
                    if (delta !== 0) {
                        offsetPosition = __sveltets_store_get(cache).direction === 'horizontal'
                            ? { x: -delta, y: 0 }
                            : { x: 0, y: -delta };
                        cachedRects = translateRectsBy(cachedRects, 0, offsetPosition);
                    }
                    if (dragScrollCurrent === dragScrollTarget) {
                        checkScroll();
                    }
                    if (active) {
                        // TODO: I think this is part of the padding bug, but we need to run the
                        hoverCallback();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // Update scroll
    ;
    (function () {
        $: {
            if (__sveltets_store_get(dragging) === 'dragging' && !!dragScrollTween) {
                dropZone[__sveltets_store_get(cache).scrollKey] = __sveltets_store_get(dragScrollTween);
                postScrollUpdate();
            }
        }
    });
    (function () {
        var _a;
        $: {
            if (((_a = __sveltets_store_get(dragTarget)) === null || _a === void 0 ? void 0 : _a.controllingDropZoneId) === id) {
                // I like guards
                if (__sveltets_store_get(dragging) !== 'none') {
                    dragTarget.update(function (target) {
                        var dragOffset = __sveltets_store_get(dragTween);
                        target.dragElement.style.transform = "translate3d(" + dragOffset.x + "px, " + dragOffset.y + "px, 0)";
                        target.cachedRect = moveRectTo(target.cachedRect, {
                            x: dragOffset.x + target.sourceRect.x,
                            y: dragOffset.y + target.sourceRect.y
                        });
                        return target;
                    });
                }
                if (__sveltets_store_get(dragging) === 'dragging') {
                    var overlapping = __sveltets_store_get(dropTargets)
                        .map(function (target) {
                        return {
                            target: target,
                            overlap: percentOverlap(__sveltets_store_get(dragTarget).cachedRect, target.rect)
                        };
                    })
                        .reduce(function (acc, next) {
                        if (next.overlap.overlapX > acc.overlap.overlapX ||
                            next.overlap.overlapY > acc.overlap.overlapY) {
                            return next;
                        }
                        return acc;
                    });
                    var hasDropTarget = overlapping.overlap.overlapX > 0 &&
                        overlapping.overlap.overlapY > 0;
                    var valid = hasDropTarget && overlapping.target.canDrop();
                    if (valid) {
                        if (!!currentDropTarget &&
                            currentDropTarget.dropTarget.id !==
                                overlapping.target.id) {
                            currentDropTarget.dropTarget.leaveDropZone();
                            currentDropTarget = undefined;
                        }
                        if (!currentDropTarget) {
                            overlapping.target.enterDropZone();
                        }
                        var hoverResult = overlapping.target.hoverCallback();
                        currentDropTarget = {
                            dropTarget: overlapping.target,
                            hoverResult: hoverResult
                        };
                    }
                    else if (!!currentDropTarget) {
                        currentDropTarget.dropTarget.leaveDropZone();
                        currentDropTarget = undefined;
                    }
                }
            }
        }
    });
    onMount(function () {
        mounted = true;
    });
    onDestroy(function () {
        dropTargets.set(__sveltets_store_get(dropTargets).filter(function (dt) { return dt.id !== id; }));
    });
    ;
    (function () { return (<>



    <sveltewindow onmousemove={moveDraggable} onmouseup={endDrag} onmouseleave={endDrag}/>


    {function () {
        if (enableResizeListeners) {
            <>
    <div {...__sveltets_ensureType(__sveltets_ctorOf(__sveltets_mapElementTag('div')), dropZone)} {...__sveltets_empty(currentWidth = __sveltets_instanceOf(HTMLDivElement).clientWidth)} {...__sveltets_empty(currentHeight = __sveltets_instanceOf(HTMLDivElement).clientHeight)} class={"dropContainer " + (__sveltets_store_get(cache).direction === 'horizontal' ? 'horizontal' : 'vertical')}>
        {__sveltets_each(__sveltets_store_get(cache).items, function (item) { return (item.id) && <>
            <div {...__sveltets_ensureType(__sveltets_ctorOf(__sveltets_mapElementTag('div')), wrappingElements[item.id])} class="dragContainer">
                <slot name="listItem" data={{ item: item, isDraggingOver: !!currentlyDraggingOver && currentlyDraggingOver.item.id === item.id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } }}/>
            </div>
        </>; })}
    </div>
            </>;
        }
        else {
            <>
    <div {...__sveltets_ensureType(__sveltets_ctorOf(__sveltets_mapElementTag('div')), dropZone)} class={"dropContainer " + (__sveltets_store_get(cache).direction === 'horizontal' ? 'horizontal' : 'vertical')}>
        {__sveltets_each(__sveltets_store_get(cache).items, function (item) { return (item.id) && <>
            <div {...__sveltets_ensureType(__sveltets_ctorOf(__sveltets_mapElementTag('div')), wrappingElements[item.id])} class="dragContainer">
                <slot name="listItem" data={{ item: item, isDraggingOver: !!currentlyDraggingOver && currentlyDraggingOver.item.id === item.id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } }}/>
            </div>
        </>; })}
    </div>
            </>;
        }
    }}</>); });
    return { props: { items: items, key: key, capacity: capacity, disabled: disabled, disableScrollOnDrag: disableScrollOnDrag, disableDropSpacing: disableDropSpacing, enableResizeListeners: enableResizeListeners, direction: direction, allowDrop: allowDrop }, slots: { 'listItem': { data: { item: __sveltets_unwrapArr($cache.items), isDraggingOver: !!currentlyDraggingOver && currentlyDraggingOver.item.id === __sveltets_unwrapArr($cache.items).id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } } } }, getters: { id: id }, events: {} };
}
var DropList__SvelteComponent_ = /** @class */ (function (_super) {
    __extends(DropList__SvelteComponent_, _super);
    function DropList__SvelteComponent_() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DropList__SvelteComponent_.prototype, "id", {
        get: function () { return render().getters.id; },
        enumerable: false,
        configurable: true
    });
    return DropList__SvelteComponent_;
}(createSvelte2TsxComponent(__sveltets_partial(__sveltets_with_any_event(render)))));
export default DropList__SvelteComponent_;

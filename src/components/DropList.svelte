<style>
    .dropContainer {
        height: 100%;
        width: 100%;
        overscroll-behavior: contain;
    }

    .dragContainer {
        width: fit-content;
        height: fit-content;
        flex-shrink: 0;
        flex-grow: 0;
    }

    .horizontal {
        display: flex;
        overflow-x: scroll;
    }

    .vertical {
        overflow-y: scroll;
    }
</style>

<script lang="ts">
    import {
        onMount,
        tick,
        onDestroy,
        createEventDispatcher,
        getContext,
    } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import {
        computeMidpoint,
        makeDraggableElement,
        calculatePlacement,
        overlap,
        percentOverlap,
        removePaddingFromRect,
        removePaddingFromHoverResult,
        updateContainingStyleSize,
        moveRectTo,
        pixelStringToNumber,
        growOrShrinkRectInList,
        translateRectsBy,
        lerp,
    } from '../helpers/utilities';
    import {
        dragging,
        dropTargets,
        dragTarget,
        dropTargetId,
        dragDropSettings,
        createDropTargetCache,
    } from '../helpers/stores';

    import type { Writable } from 'svelte/store';
    import type {
        Id,
        Item,
        Position,
        Rect,
        DropTarget,
        DropCallback,
        DropGroup,
        HoverCallback,
        HoverResult,
        Placement,
    } from '../helpers/types';

    export let items: Array<Item>;
    export let key: string | undefined = undefined;
    export let capacity = Number.POSITIVE_INFINITY;
    export let disabled: boolean = false;
    export let disableScrollOnDrag: boolean =
        $dragDropSettings.defaults.disableScrollOnDrag;
    export let disableDropSpacing: boolean =
        $dragDropSettings.defaults.disableDropSpacing;
    export let enableResizeListeners: boolean =
        $dragDropSettings.defaults.enableResizeListeners;
    export let direction: 'horizontal' | 'vertical' =
        $dragDropSettings.defaults.direction;
    export let allowDrop: (
        item: Item,
        sourceDropZone: number
    ) => boolean = () => true;
    export let identifier: Id | undefined;

    const id = dropTargetId.next();
    const dropGroup: DropGroup | undefined = getContext('reactive-drop-group');
    const cache = createDropTargetCache({
        items: [],
        direction,
    });

    let cachedRects: Array<Rect | undefined> = [];
    let cachedDropZoneRect: Rect;
    let cachedDisplay: string | undefined;
    let wrappingElements: { [id: string]: HTMLDivElement } = {};
    let dropZone: HTMLDivElement;
    let currentWidth: number = 0;
    let currentHeight: number = 0;
    let mounted = false;
    let potentiallDraggedId: Id | undefined = undefined;
    let currentlyDraggingOver: HoverResult = undefined;
    let previouslyDraggedOver: HoverResult[] = [];
    let draggableDragStart: Position | undefined = undefined;
    let handleDelayedEvent: (() => void) | undefined;
    // Tweened isn't exported, so use Writable since it is _mostly_ correct
    let dragTween: Writable<Position> | undefined = undefined;
    let sourceElementTween: Writable<number> | undefined = undefined;
    let hoverEnterElementTween: Writable<number> | undefined = undefined;
    let hoverLeaveElementTweens: Writable<number[]> | undefined = undefined;
    let dragScrollTween: Writable<number> | undefined = undefined;
    let dragScrollTarget: number;
    let dragScrollCurrent: number;
    let currentDropTarget:
        | { dropTarget: DropTarget; hoverResult: HoverResult | undefined }
        | undefined = undefined;
    let hierarchyKey: string | undefined = key ?? dropGroup?.key;
    let active: boolean = false;

    $: {
        hierarchyKey = key ?? dropGroup?.key;
    }

    const dispatch = createEventDispatcher();

    const moveDraggable = (event: MouseEvent) => {
        if (
            $dragTarget?.controllingDropZoneId === id &&
            ($dragging === 'picking-up' || $dragging === 'dragging')
        ) {
            event.preventDefault();
            $dragTween = {
                x: event.clientX - draggableDragStart.x,
                y: event.clientY - draggableDragStart.y,
            };
        }
    };

    const cleanupAfterDrag = () => {
        $dragging = 'none';
        document.body.removeChild($dragTarget.dragElement);
        let containingElement =
            wrappingElements[($dragTarget.item.id as unknown) as string];
        containingElement.style[$cache.dimensionKey] = '';
        containingElement.style.paddingTop = '';
        containingElement.style.paddingBottom = '';
        containingElement.style.paddingLeft = '';
        containingElement.style.paddingRight = '';
        (containingElement
            .children[0] as HTMLElement).style.display = cachedDisplay;
        if (
            !!currentlyDraggingOver &&
            currentlyDraggingOver.item.id === $dragTarget.item.id
        ) {
            currentlyDraggingOver = undefined;
            hoverEnterElementTween = undefined;
        }
        $dropTargets
            .filter((target) => target.key === hierarchyKey)
            .forEach((target) => target.cleanupDropZone());
        $dragTarget = undefined;
    };

    const cleanupDropZone = () => {
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

    const endDrag = async (event: MouseEvent) => {
        if (
            $dragTarget?.controllingDropZoneId === id &&
            ($dragging === 'picking-up' || $dragging === 'dragging')
        ) {
            event.preventDefault();
            if (!!currentDropTarget) {
                // Ensure we have the latest hoverResult, but don't update it to `undefined` if it was defined.
                let hoverResult =
                    currentDropTarget.dropTarget.hoverCallback() ||
                    currentDropTarget.hoverResult;
                $dragging = 'dropping';
                let offset: { x: number; y: number };
                // go go gadget structural typing
                if (!!hoverResult) {
                    const boundingRect = hoverResult.element.getBoundingClientRect();
                    if (hoverResult.placement === 'before') {
                        offset = boundingRect;
                    } else {
                        const strippedRect = removePaddingFromRect(
                            hoverResult.element,
                            boundingRect
                        );
                        if (direction === 'horizontal') {
                            offset = {
                                x: boundingRect.x + strippedRect.width,
                                y: boundingRect.y,
                            };
                        } else {
                            offset = {
                                x: boundingRect.x,
                                y: boundingRect.y + strippedRect.height,
                            };
                        }
                    }
                } else {
                    offset = currentDropTarget.dropTarget.rect;
                }
                const position = {
                    x: offset.x - $dragTarget.sourceRect.x,
                    y: offset.y - $dragTarget.sourceRect.y,
                };
                // Tweened .set returns a promise that resolves, but our types don't show that
                await dragTween.set(position);
                currentDropTarget.dropTarget.dropCallback(hoverResult);
                // We only send drop events when reordering a list, since the element never really left
                if (currentDropTarget.dropTarget.id !== id) {
                    const dragOutResult = {
                        item: $dragTarget.item,
                        listSnapshot: [
                            ...$cache.items.filter(
                                (cachedItem) =>
                                    cachedItem.id !== $dragTarget.item.id
                            ),
                        ],
                        destinationDropZone: currentDropTarget.dropTarget.id,
                    };
                    if (!!dropGroup && dropGroup.key === hierarchyKey) {
                        dropGroup.onDragOut(
                            dragOutResult.item,
                            dragOutResult.listSnapshot,
                            identifier ?? id
                        );
                    }
                    dispatch('itemdraggedout', dragOutResult);
                }
                cleanupAfterDrag();
            } else {
                $dragging = 'returning';
                sourceElementTween.set(
                    $dragTarget.sourceRect[$cache.dimensionKey]
                );
                if (!!currentlyDraggingOver) {
                    startDragOff();
                }
                // Tweened .set returns a promise that resolves, but our types don't show that
                await dragTween.set({ x: 0, y: 0 });
                if (!!dropGroup && dropGroup.key === hierarchyKey) {
                    dropGroup.onDragCancel($dragTarget.item, identifier ?? id);
                }
                dispatch('dragcancelled', {
                    item: $dragTarget.item,
                });
                cleanupAfterDrag();
            }
        }
    };

    const handleDraggableMouseDown = (
        event: MouseEvent,
        id: Id,
        delayedEvent?: (event: MouseEvent) => void
    ) => {
        if (
            !disabled &&
            !!$cache.items.find((c) => c.id === id) &&
            event.button === 0
        ) {
            draggableDragStart = { x: event.clientX, y: event.clientY };
            potentiallDraggedId = id;
            if (!!delayedEvent) {
                handleDelayedEvent = () => {
                    delayedEvent(event);
                };
            }
        } else if (!!delayedEvent) {
            delayedEvent(event);
        }
    };

    const handleDraggableMouseUp = () => {
        if ($dragging === 'none') {
            if (handleDelayedEvent) {
                handleDelayedEvent();
            }
            draggableDragStart = undefined;
            potentiallDraggedId = undefined;
            handleDelayedEvent = undefined;
        }
    };

    const handleDraggableMouseMove = async (event: MouseEvent) => {
        if (!!draggableDragStart && $dragging === 'none') {
            let dx = draggableDragStart.x - event.clientX;
            let dy = draggableDragStart.y - event.clientY;
            if (
                dx * dx + dy * dy >
                $dragDropSettings.globals.dragThresholdPixels
            ) {
                $dragging = 'picking-up';
                const containingElement =
                    wrappingElements[
                        (potentiallDraggedId as unknown) as string
                    ];
                const cloned = makeDraggableElement(
                    containingElement,
                    potentiallDraggedId
                );
                document.body.append(cloned);
                $dragTarget = {
                    item: $cache.items.find(
                        (c) => c.id === potentiallDraggedId
                    )!,
                    key: hierarchyKey,
                    controllingDropZoneId: id,
                    dragElement: cloned,
                    sourceRect: containingElement.getBoundingClientRect(),
                    cachedRect: cloned.getBoundingClientRect(),
                };
                dragTween = tweened(
                    { x: 0, y: 0 },
                    {
                        duration: $dragDropSettings.globals.animationMs,
                        easing: cubicOut,
                    }
                );
                sourceElementTween = tweened(
                    $dragTarget.sourceRect[$cache.dimensionKey],
                    {
                        duration: $dragDropSettings.globals.animationMs,
                        easing: cubicOut,
                    }
                );
                updateContainingStyleSize(
                    containingElement,
                    $cache.direction,
                    $dragTarget.sourceRect[$cache.dimensionKey]
                );
                const child = containingElement.children[0] as HTMLElement;
                cachedDisplay = child.style.display;
                child.style.display = 'none';
                active = true;
                $dropTargets
                    .filter((target) => target.key === hierarchyKey)
                    .forEach((target) => target.prepareDropZone());
                if (!!dropGroup && dropGroup.key === hierarchyKey) {
                    dropGroup.onDragStart($dragTarget.item, identifier ?? id);
                }
                // Tweened .set returns a promise that resolves, but our types don't show that
                await sourceElementTween.set(0);
                $dragging = 'dragging';
                cachedRects = [];
            }
        }
    };

    const prepareDropZone = () => {
        dragScrollCurrent = dropZone[$cache.scrollKey];
        dragScrollTarget = dragScrollCurrent;
        potentiallDraggedId = undefined;
        handleDelayedEvent = undefined;
        currentlyDraggingOver = undefined;
        currentDropTarget = undefined;
        previouslyDraggedOver = [];
    };

    const dropCallback: DropCallback = (drop: HoverResult | undefined) => {
        let dropIndex: number;
        if (!!drop) {
            if (drop.placement === 'before') {
                dropIndex = drop.index;
            } else {
                dropIndex = drop.index + 1;
            }
        } else {
            dropIndex = 0;
        }
        // Always filter because it isn't that expensive and it avoids special casing dropping back in the same list (as much as possible)
        const firstSection = $cache.items
            .slice(0, dropIndex)
            .filter((cachedItem) => cachedItem.id !== $dragTarget.item.id);
        const secondSection = $cache.items
            .slice(dropIndex)
            .filter((cachedItem) => cachedItem.id !== $dragTarget.item.id);
        const listSnapshot = [
            ...firstSection,
            $dragTarget.item,
            ...secondSection,
        ];
        const finalIndex = listSnapshot.findIndex(
            (snapshotItem) => snapshotItem.id === $dragTarget.item.id
        );
        if (!!currentlyDraggingOver) {
            removePaddingFromHoverResult(currentlyDraggingOver);
            currentlyDraggingOver = undefined;
            hoverEnterElementTween = undefined;
        }
        const dropInResult = {
            item: $dragTarget.item,
            index: finalIndex,
            insertedAfter:
                finalIndex > 0 ? $cache.items[finalIndex - 1] : undefined,
            listSnapshot,
            sourceDropZone: $dragTarget.controllingDropZoneId,
        };
        if (!!dropGroup && dropGroup.key === hierarchyKey) {
            dropGroup.onDropIn(
                dropInResult.item,
                dropInResult.index,
                dropInResult.insertedAfter,
                dropInResult.listSnapshot,
                dropInResult.sourceDropZone,
                identifier ?? id
            );
        }
        dispatch('itemdroppedin', dropInResult);
    };

    const startDragOver = (hoverResult: HoverResult) => {
        if (disableDropSpacing) {
            return;
        }
        const draggedOffIndex = previouslyDraggedOver.findIndex(
            (previous) =>
                previous.item.id === hoverResult.item.id &&
                previous.placement === hoverResult.placement
        );
        let startingSize = 0;
        if (draggedOffIndex > -1) {
            previouslyDraggedOver = previouslyDraggedOver.filter(
                (_, index) => index !== draggedOffIndex
            );
            const sizes = $hoverLeaveElementTweens;
            startingSize = Math.min(
                sizes[draggedOffIndex],
                $dragTarget.cachedRect[$cache.dimensionKey]
            );
            const filteredSizes = sizes.filter(
                (_, index) => index !== draggedOffIndex
            );
            hoverLeaveElementTweens = tweened(filteredSizes, {
                duration: $dragDropSettings.globals.animationMs,
                easing: cubicOut,
            });
            hoverLeaveElementTweens.set(
                new Array(filteredSizes.length).fill(0)
            );
        }

        currentlyDraggingOver = hoverResult;
        hoverEnterElementTween = tweened(startingSize, {
            duration: $dragDropSettings.globals.animationMs,
            easing: cubicOut,
        });
        hoverEnterElementTween.set($dragTarget.cachedRect[$cache.dimensionKey]);
    };

    const startDragOff = () => {
        if (!currentlyDraggingOver) {
            return;
        }
        const indexOfCurrent = previouslyDraggedOver.findIndex(
            (prev) =>
                prev.item.id === currentlyDraggingOver.item.id &&
                prev.placement === currentlyDraggingOver.placement
        );
        let previousTweenValues = !!hoverLeaveElementTweens
            ? $hoverLeaveElementTweens
            : [];
        if (indexOfCurrent >= 0) {
            previouslyDraggedOver = previouslyDraggedOver.filter(
                (_, index) => index !== indexOfCurrent
            );
            previousTweenValues = previousTweenValues.filter(
                (_, index) => index !== indexOfCurrent
            );
        }
        previouslyDraggedOver = [
            ...previouslyDraggedOver,
            currentlyDraggingOver,
        ];
        hoverLeaveElementTweens = tweened(
            [
                ...previousTweenValues,
                Math.min(
                    $hoverEnterElementTween,
                    $dragTarget.cachedRect[$cache.dimensionKey]
                ),
            ],
            {
                duration: $dragDropSettings.globals.animationMs,
                easing: cubicOut,
            }
        );
        hoverLeaveElementTweens.set(
            new Array(previousTweenValues.length + 1).fill(0)
        );
        hoverEnterElementTween = undefined;
        currentlyDraggingOver = undefined;
    };

    const checkScroll = () => {
        if (disableScrollOnDrag) {
            dragScrollTween = undefined;
            dragScrollTarget = dragScrollCurrent;
            return;
        }
        const midpoint =
            $cache.direction === 'horizontal'
                ? computeMidpoint($dragTarget.cachedRect).x
                : computeMidpoint($dragTarget.cachedRect).y;
        const compOffset =
            $cache.direction === 'horizontal'
                ? cachedDropZoneRect.x
                : cachedDropZoneRect.y;
        let threshold = Math.min(
            Math.max(
                $dragDropSettings.globals.scrollOnDragThresholdPercent *
                    cachedDropZoneRect[$cache.dimensionKey],
                $dragDropSettings.globals.scrollOnDragMinPixels
            ),
            $dragDropSettings.globals.scrollOnDragMaxPixels
        );
        if (midpoint <= threshold + compOffset) {
            const ratio = 1 - (midpoint - compOffset) / threshold;
            if (dragScrollTarget >= dragScrollCurrent) {
                dragScrollTween = tweened(dragScrollCurrent, {
                    duration: 1000,
                });
                /* Use truncation rather than floor because it is more consistent 
               Math.trunc(1.1) === 1, Math.trunc(-1.1) === -1 */
                dragScrollTarget = Math.trunc(
                    dragScrollCurrent -
                        lerp(
                            ratio,
                            $dragDropSettings.globals.minDragScrollSpeed,
                            $dragDropSettings.globals.maxDragScrollSpeed
                        )
                );
                dragScrollTween.set(dragScrollTarget);
            }
        } else if (
            midpoint >=
            cachedDropZoneRect[$cache.dimensionKey] - threshold + compOffset
        ) {
            const ratio =
                (midpoint -
                    (cachedDropZoneRect[$cache.dimensionKey] -
                        threshold +
                        compOffset)) /
                threshold;
            if (dragScrollTarget <= dragScrollCurrent) {
                dragScrollTween = tweened(dragScrollCurrent, {
                    duration: $dragDropSettings.globals.animationMs,
                });
                dragScrollTarget = Math.trunc(
                    dragScrollCurrent +
                        lerp(
                            ratio,
                            $dragDropSettings.globals.minDragScrollSpeed,
                            $dragDropSettings.globals.maxDragScrollSpeed
                        )
                );
                dragScrollTween.set(dragScrollTarget);
            }
        } else {
            dragScrollTween = undefined;
            dragScrollTarget = dragScrollCurrent;
        }
    };

    const hoverCallback: HoverCallback = () => {
        if ($cache.items.length === 0) {
            return undefined;
        }
        checkScroll();
        let overlapped = false;
        const overlapping = [];
        for (let index = 0; index < $cache.items.length; index++) {
            const cachedItem = $cache.items[index];
            const element =
                wrappingElements[(cachedItem.id as unknown) as string];
            if (
                index >= cachedRects.length ||
                cachedRects[index] === undefined
            ) {
                cachedRects[index] = element.getBoundingClientRect();
            }
            let overlaps = overlap($dragTarget.cachedRect, cachedRects[index]!);
            let rectWithoutPadding = removePaddingFromRect(
                element,
                cachedRects[index]!
            );
            let placement = calculatePlacement(
                rectWithoutPadding,
                $dragTarget.cachedRect,
                $cache.direction
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
        // Since cachedItems must be non-empty. If nothing overlaps, we are past the end of the list.
        if (overlapping.length === 0) {
            const lastIndex = $cache.items.length - 1;
            const lastItem = $cache.items[lastIndex];
            overlapping.push({
                index: lastIndex,
                item: lastItem,
                element: wrappingElements[(lastItem.id as unknown) as string],
                placement: 'after' as Placement,
            });
        }
        const midpoint = Math.trunc(
            (overlapping[0].index + overlapping[overlapping.length - 1].index) /
                2
        );
        let overlappedItem = overlapping.find((o) => o.index === midpoint);
        /* Only use 'before' placement at the start of the list. Since we are changing padding,
     we want to reduce the chance of weird interactions with wrapping.
     */
        if (overlappedItem.placement === 'before' && overlappedItem.index > 0) {
            const indexBefore = overlappedItem.index - 1;
            const itemBefore = $cache.items[indexBefore];
            overlappedItem = {
                index: indexBefore,
                item: itemBefore,
                element: wrappingElements[(itemBefore.id as unknown) as string],
                placement: 'after' as Placement,
            };
        }
        if (!currentlyDraggingOver) {
            startDragOver(overlappedItem);
        } else if (
            currentlyDraggingOver.item.id !== overlappedItem.item.id ||
            currentlyDraggingOver.placement !== overlappedItem.placement
        ) {
            startDragOff();
            startDragOver(overlappedItem);
        }
        return overlappedItem;
    };

    const enterDropZone = () => {
        active = true;
        dispatch('dropzoneenter', {
            item: $dragTarget.item,
            rect: $dragTarget.cachedRect,
        });
    };

    const leaveDropZone = () => {
        active = false;
        if (!!currentlyDraggingOver) {
            startDragOff();
        }
        dragScrollTarget = dragScrollCurrent;
        dragScrollTween = undefined;
        dispatch('dropzoneleave', {
            item: $dragTarget.item,
            rect: $dragTarget.cachedRect,
        });
    };

    // Update the dropTarget for this dropZone
    $: {
        if (mounted) {
            if (
                enableResizeListeners &&
                (cachedDropZoneRect.width !== currentWidth ||
                    cachedDropZoneRect.height !== currentHeight)
            ) {
                let bounding = dropZone.getBoundingClientRect();
                cachedDropZoneRect = {
                    x: bounding.left,
                    y: bounding.top,
                    width: currentWidth,
                    height: currentHeight,
                };
                $dropTargets = [
                    ...$dropTargets.filter((dt) => dt.id !== id),
                    {
                        id,
                        key: hierarchyKey,
                        rect: cachedDropZoneRect,
                        dropElement: dropZone,
                        dropCallback,
                        hoverCallback,
                        prepareDropZone,
                        enterDropZone,
                        leaveDropZone,
                        hasItem,
                        getEventHandlers,
                        cleanupDropZone,
                        canDrop,
                    },
                ];
            }
        }
    }

    // Update list of items
    $: {
        if ($dragging === 'none' || hierarchyKey !== $dragTarget.key) {
            cache.set({
                items,
                direction,
            });
        }
    }

    // Hide element that was dragged
    $: {
        if (
            $dragTarget?.controllingDropZoneId === id &&
            ($dragging === 'picking-up' || $dragging === 'returning')
        ) {
            updateContainingStyleSize(
                wrappingElements[$dragTarget.item.id],
                $cache.direction,
                $sourceElementTween
            );
        }
    }

    // Drop preview transition in
    $: {
        if (!!currentlyDraggingOver && !!hoverEnterElementTween) {
            const offset = $hoverEnterElementTween;
            const lastOffset = pixelStringToNumber(
                currentlyDraggingOver.element.style[
                    $cache.paddingKeys[currentlyDraggingOver.placement]
                ]
            );
            currentlyDraggingOver.element.style[
                $cache.paddingKeys[currentlyDraggingOver.placement]
            ] = `${offset}px`;
            const delta = offset - lastOffset;
            const offsetPosition =
                $cache.direction === 'horizontal'
                    ? { x: delta, y: 0 }
                    : { x: 0, y: delta };
            if (cachedRects.length >= currentlyDraggingOver.index) {
                cachedRects = growOrShrinkRectInList(
                    cachedRects,
                    currentlyDraggingOver.index,
                    offsetPosition
                );
            }
        }
    }

    // Drop preview transition out
    $: {
        if (previouslyDraggedOver.length > 0 && !!hoverLeaveElementTweens) {
            const sizes = $hoverLeaveElementTweens;
            const deltas: Array<{ index: number; delta: number }> = [];
            const previousSizes = previouslyDraggedOver.map((target) => {
                return pixelStringToNumber(
                    target.element.style[$cache.paddingKeys[target.placement]]
                );
            });
            previouslyDraggedOver = previouslyDraggedOver.map(
                (target, index) => {
                    const delta = sizes[index] - previousSizes[index];
                    deltas.push({ index: target.index, delta });
                    target.element.style[
                        $cache.paddingKeys[target.placement]
                    ] = `${sizes[index]}px`;
                    return target;
                }
            );
            let zeros = 0;
            for (let i = 0; i < sizes.length; i++) {
                if (sizes[i] > 0) {
                    break;
                }
                ++zeros;
            }
            if (zeros > 0) {
                previouslyDraggedOver = previouslyDraggedOver.slice(zeros);
                hoverLeaveElementTweens = tweened(sizes.slice(zeros), {
                    duration: $dragDropSettings.globals.animationMs,
                    easing: cubicOut,
                });
                hoverLeaveElementTweens.set(
                    new Array(previouslyDraggedOver.length).fill(0)
                );
            }
            deltas.forEach(({ index, delta }) => {
                if (cachedRects.length >= index) {
                    const offsetPosition =
                        $cache.direction === 'horizontal'
                            ? { x: delta, y: 0 }
                            : { x: 0, y: delta };
                    cachedRects = growOrShrinkRectInList(
                        cachedRects,
                        index,
                        offsetPosition
                    );
                }
            });
        }
    }

    const hasItem = (itemId: Id) => {
        return !!$cache.items.find((c) => c.id === itemId);
    };

    const getEventHandlers = () => {
        return {
            handleMouseDown: handleDraggableMouseDown,
            handleMouseUp: handleDraggableMouseUp,
            handleMouseMove: handleDraggableMouseMove,
        };
    };

    const canDrop = () => {
        return (
            !disabled &&
            $dragTarget.key === hierarchyKey &&
            capacity - $cache.items.length > 0 &&
            allowDrop($dragTarget.item, $dragTarget.controllingDropZoneId)
        );
    };

    const postScrollUpdate = async () => {
        const previous = dragScrollCurrent;
        await tick();
        dragScrollCurrent = dropZone[$cache.scrollKey];
        const delta = dragScrollCurrent - previous;
        if (delta !== 0) {
            const offsetPosition =
                $cache.direction === 'horizontal'
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
    };

    // Update scroll
    $: {
        if ($dragging === 'dragging' && !!dragScrollTween) {
            dropZone[$cache.scrollKey] = $dragScrollTween;
            postScrollUpdate();
        }
    }

    // Move dragTarget
    $: {
        if ($dragTarget?.controllingDropZoneId === id) {
            // I like guards
            if ($dragging !== 'none') {
                dragTarget.update((target) => {
                    const dragOffset = $dragTween;
                    target.dragElement.style.transform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`;
                    target.cachedRect = moveRectTo(target.cachedRect, {
                        x: dragOffset.x + target.sourceRect.x,
                        y: dragOffset.y + target.sourceRect.y,
                    });
                    return target;
                });
            }
            if ($dragging === 'dragging') {
                const overlapping = $dropTargets
                    .map((target) => {
                        return {
                            target,
                            overlap: percentOverlap(
                                $dragTarget.cachedRect,
                                target.rect
                            ),
                        };
                    })
                    .reduce((acc, next) => {
                        if (
                            next.overlap.overlapX > acc.overlap.overlapX ||
                            next.overlap.overlapY > acc.overlap.overlapY
                        ) {
                            return next;
                        }
                        return acc;
                    });
                const hasDropTarget =
                    overlapping.overlap.overlapX > 0 &&
                    overlapping.overlap.overlapY > 0;

                const valid = hasDropTarget && overlapping.target.canDrop();

                if (valid) {
                    if (
                        !!currentDropTarget &&
                        currentDropTarget.dropTarget.id !==
                            overlapping.target.id
                    ) {
                        currentDropTarget.dropTarget.leaveDropZone();
                        currentDropTarget = undefined;
                    }
                    if (!currentDropTarget) {
                        overlapping.target.enterDropZone();
                    }
                    const hoverResult = overlapping.target.hoverCallback();
                    currentDropTarget = {
                        dropTarget: overlapping.target,
                        hoverResult,
                    };
                } else if (!!currentDropTarget) {
                    currentDropTarget.dropTarget.leaveDropZone();
                    currentDropTarget = undefined;
                }
            }
        }
    }

    onMount(() => {
        let bounding = dropZone.getBoundingClientRect();
        cachedDropZoneRect = {
            x: bounding.left,
            y: bounding.top,
            width: enableResizeListeners ? currentWidth : bounding.width,
            height: enableResizeListeners ? currentHeight : bounding.height,
        };
        $dropTargets = [
            ...$dropTargets,
            {
                id,
                key: hierarchyKey,
                rect: cachedDropZoneRect,
                dropElement: dropZone,
                dropCallback,
                hoverCallback,
                prepareDropZone,
                enterDropZone,
                leaveDropZone,
                hasItem,
                getEventHandlers,
                cleanupDropZone,
                canDrop,
            },
        ];
        mounted = true;
    });

    onDestroy(() => {
        $dropTargets = $dropTargets.filter((dt) => dt.id !== id);
    });
</script>

<svelte:window
    on:mousemove="{moveDraggable}"
    on:mouseup="{endDrag}"
    on:mouseleave="{endDrag}"
/>
<!--
<div>
<slot name="standin" data={}></slot>
</div>
-->

{#if enableResizeListeners}
    <div
        bind:this="{dropZone}"
        bind:clientWidth="{currentWidth}"
        bind:clientHeight="{currentHeight}"
        class="{`dropContainer ${$cache.direction === 'horizontal' ? 'horizontal' : 'vertical'}`}"
    >
        {#each $cache.items as item (item.id)}
            <div bind:this="{wrappingElements[item.id]}" class="dragContainer">
                <slot
                    name="listItem"
                    data="{{ item, isDraggingOver: !!currentlyDraggingOver && currentlyDraggingOver.item.id === item.id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } }}"
                />
            </div>
        {/each}
    </div>
{:else}
    <div
        bind:this="{dropZone}"
        class="{`dropContainer ${$cache.direction === 'horizontal' ? 'horizontal' : 'vertical'}`}"
    >
        {#each $cache.items as item (item.id)}
            <div bind:this="{wrappingElements[item.id]}" class="dragContainer">
                <slot
                    name="listItem"
                    data="{{ item, isDraggingOver: !!currentlyDraggingOver && currentlyDraggingOver.item.id === item.id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } }}"
                />
            </div>
        {/each}
    </div>
{/if}

export function makeDraggableElement(originalElement, id) {
    const rect = originalElement.getBoundingClientRect();
    const draggedEl = originalElement.cloneNode(true);
    draggedEl.id = `reactive-dnd-drag-placeholder`;
    draggedEl.style.position = 'fixed';
    draggedEl.style.top = `${rect.top}px`;
    draggedEl.style.left = `${rect.left}px`;
    draggedEl.style.zIndex = '9999';
    draggedEl.style.cursor = 'grabbing';
    const dragHandle = draggedEl.querySelector(`#reactive-dnd-drag-handle-${id}`);
    if (!!dragHandle) {
        dragHandle.style.cursor = 'grabbing';
    }
    return draggedEl;
}
export function overlap(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.x + rect2.width < rect1.x ||
        rect2.y + rect2.height < rect1.y);
}
export function percentOverlap(rect1, rect2) {
    const maxX = Math.min(rect1.width + rect1.x, rect2.width + rect2.x);
    const minX = Math.max(rect1.x, rect2.x);
    const maxY = Math.min(rect1.height + rect1.y, rect2.height + rect2.y);
    const minY = Math.max(rect1.y, rect2.y);
    return {
        overlapX: Math.max(maxX - minX, 0) / rect1.width,
        overlapY: Math.max(maxY - minY, 0) / rect1.height,
    };
}
export function computeMidpoint(rect) {
    return { x: rect.width / 2 + rect.x, y: rect.height / 2 + rect.y };
}
export function removePaddingFromRect(element, rect) {
    const top = pixelStringToNumber(element.style.paddingTop);
    const left = pixelStringToNumber(element.style.paddingLeft);
    const right = pixelStringToNumber(element.style.paddingRight);
    const bottom = pixelStringToNumber(element.style.paddingBottom);
    return {
        x: rect.x + left,
        y: rect.y + top,
        width: rect.width - (left + right),
        height: rect.height - (top + bottom),
    };
}
export function pixelStringToNumber(pixelString) {
    return pixelString && pixelString.length > 0
        ? Number.parseFloat(pixelString.substring(0, pixelString.length - 2))
        : 0;
}
export function removePaddingFromHoverResult(result) {
    result.element.style.paddingTop = '';
    result.element.style.paddingBottom = '';
    result.element.style.paddingLeft = '';
    result.element.style.paddingRight = '';
}
export function updateContainingStyleSize(containingElement, direction, amount) {
    if (direction === 'horizontal') {
        containingElement.style.width = `${amount}px`;
    }
    else {
        containingElement.style.height = `${amount}px`;
    }
}
export function calculatePlacement(rectA, rectB, direction) {
    const key = direction === 'horizontal' ? 'x' : 'y';
    return computeMidpoint(rectA)[key] > computeMidpoint(rectB)[key]
        ? 'before'
        : 'after';
}
export function growOrShrinkRectInList(rects, startIndex, offset) {
    const newRects = [...rects];
    const toResize = newRects[startIndex];
    if (!toResize || !offset) {
        console.log(toResize, rects, startIndex, offset);
    }
    newRects[startIndex] = {
        x: toResize.x,
        y: toResize.y,
        width: toResize.width + offset.x,
        height: toResize.height + offset.y,
    };
    for (let i = startIndex + 1; i < newRects.length; i++) {
        newRects[i] = translateRectBy(newRects[i], offset);
    }
    return newRects;
}
export function translateRectsBy(rects, startIndex, offset) {
    const newRects = [...rects];
    for (let i = startIndex; i < newRects.length; i++) {
        newRects[i] = translateRectBy(newRects[i], offset);
    }
    return newRects;
}
function translateRectBy(rect, offset) {
    return moveRectTo(rect, { x: rect.x + offset.x, y: rect.y + offset.y });
}
export function moveRectTo({ width, height }, { x, y }) {
    return { x, y, width, height };
}
export function clamp(num, min = 0, max = 1) {
    return Math.max(min, Math.min(max, num));
}
export function lerp(percent, min, max) {
    return clamp(percent) * (max - min) + min;
}
//# sourceMappingURL=utilities.js.map
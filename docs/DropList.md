# DropList

`DropList` is the heart of `svelte-reactive-dnd`.
You can do everything the library is capable of with just that, thought `DropGroup` and `DragHandle` will probably make things cleaner.

## Properties

The only required property is `items`

### - items

Required.
An `array` containing objects that have an `id` property. This `id` can be either a `number` or a `string`.
`DropList` caches this array while a drag is in progress.

### - identifier

Optional, unless the `DropList` is part of a `DropGroup`. Either a `number` or a `string`.
An identifier is some id that has semantic meaning in your system.
It is not used for anything in `svelte-reactive-dnd`, but will be returned whenever the library needs to give you the identity of a `DropList`.
If no `identifier` is provided, then `undefined` will be returned in those cases.

### - key

Optional.
A `string` used to group `DropList`s together, or to filter a `DropList` from a `DropGroup`.
[Example](https://svelte.dev/repl/0c97c78817b64d93997bc9f8637956e0?version=3.24.1)

### - capacity

Optional.
The maximum `number` of items this `DropList` can hold.
Prevents items from being dragged in, but will not prevent items from being dragged out.
[Example](https://svelte.dev/repl/c93a80370f1749199d69a1c38aa06d6e?version=3.24.1)

### - disabled

Optional.
If `true` it will prevent any items from being dragged out or dropped in the `DropList`
[Example](https://svelte.dev/repl/c93a80370f1749199d69a1c38aa06d6e?version=3.24.1)

### - shouldAllowDrop

Optional.
A function that takes in an `Item` and an `identifier`, and needs to return a `boolean`: `true` to allow the drop, `false` to deny it.
**This function will be called on mouse move.**
There is no `shouldAllowDrag` that should be handled by setting `disabled` on the corresponding `DragHandle` or manually when wiring up the drag events.
[Example](https://svelte.dev/repl/bed184c9a322404aafd4561058274b04?version=3.24.1)

### - overrideDropPosition

Optional.
A function that will override the built in drop hovering logic.
If this parameter is enabled, `crossingMode` will no longer have any impact.
Function signature with relevant types:

```ts
type CalculatePosition = (
    dragTarget: DragTarget,
    items: Item[],
    layouts: Layout[]
) => {
    index: number;
    placement?: 'before' | 'after';
    scrollIntoView?: boolean;
};
// Types for reference
type DragTarget = {
    item: Item;
    cachedRect: Rect;
    lastPosition: Position;
};
export type Position = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Layout = {
    rect: Rect;
    offsets: {
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
    };
};
```

`Item` is the type of whatever item is in your lists.

If `placement` is undefined, it will default to `before`.
If `scrollIntoView` is undefined, it will default to `false`.
When enabling `scrollIntoView`, you may also want to `disableScrollOnDrag`.
Since this event is called on every mouse move, the arrays passed into **are not** copies.
Modifying them may lead to unexpected behavior.
Providing an implementation for `overrideDropPosition` can be useful if you are doing drag and drop on sorted lists.
[Example](https://svelte.dev/repl/1f3ae5834b1e4111a192ecc590267aad?version=3.24.1)

### - disableScrollOnDrag

Optional.
Disables scrolling when an item is dragged to the start or end of a list.
Default value set in `dragDropSettings`.

### - disableDropSpacing

Optional.
Disables inserting a space where an item is dragged over.
Strongly recommend setting crossing mode to `center` when drop spacing is disabled.
Default value set in `dragDropSettings`.

### - disableSourceShrinking

Optional.
Disables collapsing the list where the item was dragged from.
Intended to be used in concert with `disableDropSpacing`, but may be useful on its own.
Default value set in `dragDropSettings`.

### - enableResizeListeners

Optional.
Enables resize listeners on `DropList`s that will update the size of the droppable area when the `DropList` is resized. Default value set in `dragDropSettings`.
This uses [dimension bindings](https://svelte.dev/tutorial/dimensions), which has some overhead, so it should generally only be enabled for top level items.

### - crossingMode

Decides how `DropList`s determine if the item being dragged has "moved past" an item in the list.
Options are `center` and `edge`.
The `edge` mode will shift the item in the list once the the leading edge of the dragged item has moved past its center.
The `center` mode will shift the item in the list once the center of the dragged item has moved past its center.
The `edge` mode was inspired by [this article](https://dev.to/alexandereardon/overhauling-our-collision-engine-962).
Default value set in `dragDropSettings`.

### - direction

Optional.
Direction of the `DropList`s. Either `'horizontal'` or `'vertical'`. Default value set in `dragDropSettings`.
[Horizontal DropList Example](https://svelte.dev/repl/d2e8cde072ca4b4486d56123133eb704?version=3.24.1)

## Events

[This REPL](https://svelte.dev/repl/99d1ae0413ee4a3e807f8fa4df49f1ac?version=3.24.1) logs all of the following events to the console.

### - itemdraggedout

This event fires from the source `DropList` when a drop is complete.
It does not fire if the item is dropped in the same list it was dragged from.
In many cases, `listSnapshot` is all that's needed to update the list.
But because `DropList` caches its internal list representation, `listSnapshot` may be out of date if your component is receiving updates from a remote server.
In that case it is left to the user to filter out the item themselves.

```ts
type ItemDraggedOut = {
    item: Item;
    listSnapshot: Item[];
    destinationIdentifer: number | string | undefined
}
```

`Item` is the type of whatever item is in your lists.
`destinationIdentifier` will be `undefined` if you are not populating `identifier`s for your `DropList`s

### - itemdroppedin

This event fires from the destination `DropList` when a drop is complete.
`insertedAfter` will be undefined when the index is 0.
In many cases, `listSnapshot` is all that's needed to update the list.
But because `DropList` caches its internal list representation, `listSnapshot` may be out of date if your component is receiving updates from a remote server.
In that case `index` and `insertedAfter` may be useful for determining the best position for the item.

```ts
type ItemDroppedIn = {
    item: Item;
    index: number;
    insertedAfter: Item | undefined;
    listSnapshot: Item[];
    sourceIdentifer: number | string | undefined
}
```

`Item` is the type of whatever item is in your lists.
`destinationIdentifier` will be `undefined` if you are not populating `identifier`s for your `DropList`s

### - dragcancelled

Fired from the source `DropList` once the item returns to its original position.

```ts
type DragCancelled = {
    item: Item;
}
```

`Item` is the type of whatever item is in your lists.

### - drageenter

Fired when an item is dragged over a `DropList`.
This event may fire for the source list after `DragStart`, if the item is still over the list after it is finished being picked up.

```ts
type DragEnter = {
    item: Item;
    rect: Rect;
    sourceIdentifer: number | string | undefined
}
type Rect = { x: number; y: number; width: number; height: number };
```

`Item` is the type of whatever item is in your lists.
`sourceIdentifer` will be `undefined` if you are not populating `identifier`s for your `DropList`s

### - dragleave

Fired when an item is dragged out of a `DropList`.

```ts
type DragEnter = {
    item: Item;
    rect: Rect;
}
type Rect = { x: number; y: number; width: number; height: number };
```

`Item` is the type of whatever item is in your lists.

### - dragmove

Fired when an item is moved when over a `DropList`.
`over` will be the same item that `isDraggingOver` is `true` for.

```ts
type ItemDroppedIn = {
    item: Item;
    rect: Rect;
    index: number;
    over: Item | undefiend;
}
type Rect = { x: number; y: number; width: number; height: number };
```

`Item` is the type of whatever item is in your lists.

### - dragstart

Fired from the source `DropList` as soon as the item is picked up.

```ts
type DragStart = {
    item: Item;
}
```

`Item` is the type of whatever item is in your lists.

## Slots

The `slot` exposed by `DropList` is named `listItem`.
The slot's `data` property provides the `item`, as well as `isDraggingOver` and `dragEventHandlers`.

The the generated type for `item` is `unknown`, which is a bit of a pain.
AFAICT, it's a current limitations of the Svelte types.
If you know a work around, let me know!

`isDraggingOver` is a boolean, and is true whenever the dragging item is "in" the same index as the item in this slot.

`dragEventHandlers` only needs to be used if you are _not_ using `DragHandle`.
If you used `dragEventHandlers`, all three methods all need to be hooked up to the corresponding mouse events: `on:mousedown`, `on:mouseup`, and `on:mousemove`.
`handleMouseUp` and `handleMouseMove` can be wired up directly, but `handleMouseDown` requires the `id` of what's being moved to be passed in.
`handleMouseDown` can optionally take a callback that'll be called if the drag sensor determines that the user clicked, rather than dragged.

```ts
type DragEventHandlers = {
    handleMouseDown: (event: MouseEvent, id: number | string, delayedEvent?: (event: MouseEvent) => void) => void;
    handleMouseUp: () => void;
    handleMouseMove: (event: MouseEvent) => void;
};
```

Examples:  
[Basic slot usage](https://svelte.dev/repl/41d1808f4cb541228d4b602eb043d03d?version=3.24.1)  
[Using isDraggingOver](https://svelte.dev/repl/e25569ee35c046af8b98c1650a264ba6?version=3.24.1)  
[Manually wiring up events](https://svelte.dev/repl/9b52029aeeee4eed8da7b295565ae5f9?version=3.24.1)  

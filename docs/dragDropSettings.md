# dragDropSettings

The `dragDropSettings` store allows for some deeper configuration of the drag and drop experience provided by this library.
It is a simple `writable` store, so you can update it like you would any store.
`DropList` is not guaranteed to be reactive to any changes to `dragDropSettings`, so it is recommended that you set them early in your App's lifecycle and leave them be.
There are two categories of settings in `dragDropSettings`: `defaults`, which can be overridden by properties on `DropList`, and `globals`, which cannot.

## defaults

### - disableScrollOnDrag

Disables scrolling when an item is dragged to the start or end of a list.
Defaults to false.

### - disableDropSpacing

Disables inserting a space where an item is dragged over.
Strongly recommend setting crossing mode to `center` when drop spacing is disabled.
Defaults to false.

### - disableSourceShrinking

Disables collapsing the list where the item was dragged from.
Intended to be used in concert with `disableDropSpacing`, but may be useful on its own.
Defaults to false.

### - enableResizeListeners

Enables resize listeners on `DropList`s that will update the size of the droppable area when the `DropList` is resized.
Defaults to false.

### - crossingMode

Decides how `DropList`s determine if the item being dragged has "moved past" an item in the list.
Options are `center` and `edge`.
The `edge` mode will shift the item in the list once the the leading edge of the dragged item has moved past its center.
The `center` mode will shift the item in the list once the center of the dragged item has moved past its center.
The `edge` mode was inspired by [this article](https://dev.to/alexandereardon/overhauling-our-collision-engine-962).
Defaults to `edge`.

### - direction

Direction of the `DropList`s. Either `'horizontal'` or `'vertical'`.
Defaults to `'vertical'`.
[Horizontal DropList Example](https://svelte.dev/repl/d2e8cde072ca4b4486d56123133eb704?version=3.24.1)

## globals

### - dragThresholdPixels

How many pixels a the mouse has to move before a drag is detected. Defaults to 25.

### - animationMs

Duration of all animations used in `DropList`. Defaults to 200.

### - scrollOnDragThresholdPercent

What percent of the start and end of the `DropList` should be a scroll sensor. Defaults to 0.1 (10%).

### - scrollOnDragMinPixels

The minimum size of a scroll sensor. Defaults to 50.

### - scrollOnDragMaxPixels

The maximum size of a scroll sensor. Defaults to 150.

### - minDragScrollSpeed

The minimum speed the list will scroll in pixels per second. Defaults to 275.

### - maxDragScrollSpeed

The maximum speed the list will scroll in pixels per second. Defaults to 625.

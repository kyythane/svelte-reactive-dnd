# dragDropSettings

The `dragDropSettings` store allows for some deeper configuration of the drag and drop experience provided by this library.
It is a simple `writable` store, so you can update it like you would any store.
`DropList` is not guaranteed to be reactive to any changes to `dragDropSettings`, so it is recommended that you set them early in your App's lifecycle and leave them be.
There are two categories of settings in `dragDropSettings`: `defaults`, which can be overridden by properties on `DropList`, and `globals`, which cannot.

## defaults

### - disableScrollOnDrag

Disables scrolling when an item is dragged to the start or end of a list. Defaults to false.

### - disableDropSpacing

Disables inserting a space where an item is dragged over. Defaults to false.

### - enableResizeListeners

Enables resize listeners on `DropList`s that will update the size of the droppable area when the `DropList` is resized. Defaults to false.

### - direction

Direction of the `DropList`s. Either `'horizontal'` or `'vertical'`. Defaults to `'vertical'`.

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

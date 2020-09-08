# DropList

`DropList` is the heart of `svelte-reactive-dnd`.
You can do everything the library is capable of with just that, thought `DropGroup` and `DragHandle` will probably make things cleaner.

## Properties

### - items

Required.
An `array` containing objects that have an `id` property. This `id` can be either a `number` or a `string`.

### - identifier

Optional, unless the `DropList` is part of a `DropGroup`. Either a `number` or a `string`.
An identifier is some id that has semantic meaning in your system.
It is not used for anything in `svelte-reactive-dnd`, but will be used whenever the library needs to give you the identity of a `DropList`.
If it is not provided, then `undefined` will be returned in those cases.

### - key

Optional.
A `string` used to group `DropList`s together, or to filter a `DropList` from a `DropGroup`.

### - capacity

Optional.
The maximum `number` of items this `DropList` can hold.
Prevents items from being dragged in, but will not prevent items from being dragged out.

### - disabled

Optional.
If `true` it will prevent any items from being dragged out or dropped in the `DropList`

### - shouldAllowDrop

Optional.
A function that takes in an `Item` and a `DropList` `identifier`, and needs to return a `boolean`: `true` to allow the drop, `false` to deny it.
There is no `shouldAllowDrag` that should be handled by setting `disabled` on the corresponding `DragHandle` or manually when wiring up the drag events.

### - disableScrollOnDrag

Disables scrolling when an item is dragged to the start or end of a list. Default value set in `dragDropSettings`.

### - disableDropSpacing

Disables inserting a space where an item is dragged over. Default value set in `dragDropSettings`.

### - enableResizeListeners

Enables resize listeners on `DropList`s that will update the size of the droppable area when the `DropList` is resized. Default value set in `dragDropSettings`.

### - direction

Direction of the `DropList`s. Either `'horizontal'` or `'vertical'`. Default value set in `dragDropSettings`.

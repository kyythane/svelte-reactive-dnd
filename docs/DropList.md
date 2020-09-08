# DropList

`DropList` is the heart of `svelte-reactive-dnd`.
You can do everything the library is capable of with just that, thought `DropGroup` and `DragHandle` will probably make things cleaner.

## Properties

The only required property is `items`

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
A function that takes in an `Item` and a `DropList` `identifier`, and needs to return a `boolean`: `true` to allow the drop, `false` to deny it.
**This function will be called on mouse move**, so it needs to be cheap to compute.
There is no `shouldAllowDrag` that should be handled by setting `disabled` on the corresponding `DragHandle` or manually when wiring up the drag events.

### - disableScrollOnDrag

Optional.
Disables scrolling when an item is dragged to the start or end of a list. Default value set in `dragDropSettings`.

### - disableDropSpacing

Optional.
Disables inserting a space where an item is dragged over. Default value set in `dragDropSettings`.

### - enableResizeListeners

Optional.
Enables resize listeners on `DropList`s that will update the size of the droppable area when the `DropList` is resized. Default value set in `dragDropSettings`.
This uses [dimension bindings](https://svelte.dev/tutorial/dimensions), which has some overhead, so it should generally only be enabled for top level items.

### - direction

Optional.
Direction of the `DropList`s. Either `'horizontal'` or `'vertical'`. Default value set in `dragDropSettings`.

## Events

### - itemdraggedout

### - dragcancelled

### - itemdroppedin

### - drageenter

### - dragleave

### - dragmove

### - dragstart

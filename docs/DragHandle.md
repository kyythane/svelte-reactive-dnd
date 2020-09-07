# DragHandle
`DragHandle` is an optional svelte component that can be used to simplify drag event managment. It takes in two properties `itemId` and `disabled`. It provides a `slot` for you to place whatever you want to be "grabbable", which could be your whole component. Though that may click events a bit of a pain. 

## Properties
### - itemId
Required. The `id` of the the item that this `DragHandle` controlls. If this `id` is on an item in a `DropList` events will get hooked up automatically.
### - disabled
Optional. Disables the `DragHandle` (will display a `not-allowed` cursor).
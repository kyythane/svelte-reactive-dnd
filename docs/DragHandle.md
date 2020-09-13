# DragHandle

`DragHandle` is an optional svelte component that can be used to simplify drag event management.
It takes in two properties `itemId` and `disabled`.
It provides a `slot` for you to place whatever you want to be "grabbable", which could be your whole component.
Though that may click events a bit of a pain if you wrap it around a complex component, as `DragHandle` doesn't filter out any child events.
`DragHandle` does automatic wiring of events using a [context](https://svelte.dev/docs#setContext) provided by `DropList`.
This behavior can be overridden by providing your own event handlers using, `dragEventHandlers`.

## Properties

### - itemId

Required.
The `id` of the the item that this `DragHandle` controls. If this `id` is on an item in a `DropList` events will get hooked up automatically.

### - disabled

Optional.
Disables the `DragHandle` (will display a `not-allowed` cursor). [See example](https://svelte.dev/repl/4b48f17273ee4758a2c2c6ce440f6186?version=3.24.1)

### - dragEventHandlers

Optional.
Matches the type of `DropList`'s `dragEventHandlers`.
Use this if you would like to override the automatic wiring of a `DragHandle` or to intercept and modify its events.

```ts
type DragEventHandlers = {
    handleMouseDown: (event: MouseEvent, id: number | string, delayedEvent?: (event: MouseEvent) => void) => void;
    handleMouseUp: () => void;
    handleMouseMove: (event: MouseEvent) => void;
};
```

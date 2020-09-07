# DropGroup

`DropGroup` uses [contexts](https://svelte.dev/docs#setContext) to consolidate events from and inject a key into any `DropList`s in its children that do not provide their own `key`.
If a `DropList` belongs to a `DropGroup` then it must have an `identifier` that can be used to uniquely identify that `DropList` inside the `DropGroup`.
Items cannot be dragged between `DropGroup`s.

## An Example

[Please open this REPL](https://svelte.dev/repl/3cb8b7aa29f14537856bcd228e2fe949?version=3.24.1)

In this (somewhat contrived) example, we have a `DropGroup` that has influence over three `DropLists` (here wrapped in a `List` component to make things cleaner).
The fourth `DropList` provides a key, so it is not a part of the `DropGroup`.
Since it is not part of a `DropGroup`, it does not need an `identifier`.
You may choose to include identifiers anyways for consistency.
If you do not include an `identifier` and the `DropList` is part of a `DropGroup`, an error will be thrown.

Items can be dragged between any of the first three lists, but not into, or out of, the fourth.

## Events

Three events are defined:

### - `dragcomplete`

Called once the item has taken its place in the new list.
Like how `DropList` doesn't fire an `itemdraggedout` event if the item is dropped in the same list it was dragged from, `DropGroup` does not provide a `sourceResult` when the item is dropped in the same list it was dragged from.

**Types:**

```ts
type details = {
    sourceResult? : SourceResult;
    destinationResult: DestinationResult;
}

type SourceResult = {
    item: Item;
    listSnapshot: Item[];
    listIdentifier: v;
}

type DestinationResult = {
    item: Item;
    index: number;
    insertedAfter: Item | undefined;
    listSnapshot: Item[];
    listIdentifier: string | number;
}
```

`Item` is the type of whatever item is in your lists.

### - `dragstart`

Called as soon as the item is picked up.

**Types:**

```ts
type details = {
    item: Item,
    listIdentifier: string | number,
}
```

`Item` is the type of whatever item is in your lists.

### - `dragcancelled`

Called once the item returns to its original position

**Types:**

```ts
type details = {
    item: Item,
    listIdentifier: string | number,
}
```

`Item` is the type of whatever item is in your lists.

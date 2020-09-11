# svelte-reactive-dnd

A drag and drop library for Svelte

Includes support for:

- Nested Lists
- Horizontal and Vertical Lists
- Movement between lists
- Conditional drag and drop
- Drag Handles
- List capacity
- Mixed sized items
- Override drop position, with autoscroll

## Getting Started

Install the library

```bash
npm install svelte-reactive-dnd
```

Start using the parts!

```html
<script>
    import { DropList, DragHandle } from 'svelte-reactive-dnd';
    let items = [
        { id: 1, title: 'Apple' },
        { id: 2, title: 'Banana' },
        { id: 3, title: 'Cherry' },
    ];
</script>

<div class="list">
    <DropList
        {items}
        on:itemdroppedin="{({ detail }) => (items = detail.listSnapshot)}"
    >
        <div slot="listItem" let:data="{{ item }}">
            <DragHandle itemId="{item.id}">
                            <div class="item">
                                <p>{item.title}</p>
                            </div>
            </DragHandle>
        </div>
    </DropList>
</div>

<style>
    .list {
        height: 200px;
        width: 100px;
        border: solid black 1px;
        background-color: grey;
    }
    .item {
        margin: 2px;
        width: 78px;
        padding: 0px 8px;
        border: solid black 1px;
        background-color: burlywood;
    }
</style>
```

**[Play with this Example](https://svelte.dev/repl/41d1808f4cb541228d4b602eb043d03d?version=3.24.1)**

[More Examples](https://github.com/kyythane/svelte-reactive-dnd/blob/main/docs/Examples.md)

## Design

`svelte-reactive-dnd` manages your lists internally, creating a few internal divs to handle measurements and events.
It uses `padding` to manipulate the position of items in the list, relying on the browser's layout engine to animate things properly.
In my tests in Chrome, this was fairly performant with lists of up to 500 items, but please file [an issue](https://github.com/kyythane/svelte-reactive-dnd/issues) if you se otherwise!  

`DropList` maintains a cached copy of the `items` it was provided. This cache is not updated during dragging to simplify list management and provide better UX. The `itemdroppedin` event provides multiple views of how the list was manipulated that may be useful in reconciling any changes.
But in the simple case, `listSnapshot` should work great.  

`DragHandle` and `DropGroup` are provided to simplify common tasks, and to reduce the amount of wiring one has to do when building more complex drag and drop experiences, hopefully simplifying common use cases.
They are not required. With a little bit of wiring, anything they add can be done manually. To that end, they are very simple, and provide little configuration.  

## API

**WARNING: API IS NOT YET STABLE.** Will stabilize on version 1.0.0.

There are 4 exports from this library:

- [DropList](https://github.com/kyythane/svelte-reactive-dnd/blob/main/docs/DropList.md)
- [DragHandle](https://github.com/kyythane/svelte-reactive-dnd/blob/main/docs/DragHandle.md)
- [DropGroup](https://github.com/kyythane/svelte-reactive-dnd/blob/main/docs/DropGroup.md)
- [dragDropSettings](https://github.com/kyythane/svelte-reactive-dnd/blob/main/docs/dragDropSettings.md)

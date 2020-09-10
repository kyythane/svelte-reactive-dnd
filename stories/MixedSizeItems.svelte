<style>
    .base-list {
        border: solid black 1px;
        background-color: lightgray;
    }
    .vertical-list {
        height: 400px;
        width: 200px;
    }
    .horizontal-list {
        height: 58px;
        width: 500px;
    }
    .base-item {
        margin: 2px;
        padding: 0px 8px;
        border: solid black 1px;
        background-color: whitesmoke;
    }
    .vertical-item {
        width: 178px;
    }
    .horizontal-item {
        width: 78px;
    }
</style>

<script>
    import * as seedRandom from 'seedrandom';
    import DropList from '../lib/components/DropList.svelte';
    import DragHandle from '../lib/components/DragHandle.svelte';
    export let numItems;
    export let direction;
    export let minSize;
    export let maxSize;
    export let seed;
    let rng = seedRandom(seed);
    console.log(minSize, maxSize, minSize + rng() * (maxSize - minSize));
    let items = new Array(numItems)
        .fill(0)
        .map((_, index) => ({ id: index, title: `Item: ${index}` }));
</script>

<div class="{`base-list ${direction}-list`}">
    <DropList
        items="{items}"
        on:itemdroppedin="{({ detail }) => (items = detail.listSnapshot)}"
        direction="{direction}"
    >
        <div slot="listItem" let:data="{{ item }}">
            <DragHandle itemId="{item.id}">
                <div
                    class="{`base-item ${direction}-item`}"
                    style="{`${direction === 'horizontal' ? 'width' : 'height'}: ${minSize + rng() * (maxSize - minSize)}px`}"
                >
                    <p>{item.title}</p>
                </div>
            </DragHandle>
        </div>
    </DropList>
</div>

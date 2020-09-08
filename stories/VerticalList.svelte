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

<script>
    import DropList from '../lib/components/DropList.svelte'
    import DragHandle from '../lib/components/DragHandle.svelte';
    export let numItems;
    let items = new Array(numItems)
        .fill(0)
        .map((_, index) => ({ id: index, title: `Item: ${index}` }));
</script>

<div class="list">
    <DropList
        items="{items}"
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

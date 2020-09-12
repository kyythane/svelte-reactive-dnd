<style>
    .list {
        border: solid black 1px;
        background-color: lightgray;
        height: 400px;
        width: 200px;
    }
    .item {
        margin: 2px;
        padding: 0px 8px;
        border: solid black 1px;
        background-color: whitesmoke;
        width: 178px;
    }
</style>

<script>
    import DropList from '../lib/components/DropList.svelte';
    import DragHandle from '../lib/components/DragHandle.svelte';

    export let items;
    export let key;
    export let identifier;
</script>

<div class="list">
    <DropList identifier="{identifier}" items="{items}" key="{key}">
        <div slot="listItem" let:data="{{ item }}">
            <DragHandle itemId="{item.id}" disabled="{item.disabled}">
                <div class="item">
                    <p>{item.title}</p>
                </div>
            </DragHandle>
        </div>
    </DropList>
</div>

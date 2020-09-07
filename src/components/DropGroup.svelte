<script lang="ts">
    import { setContext, createEventDispatcher } from 'svelte';
    import type { DropGroup, Item } from '../helpers/types';
    import { dropGroupId } from '../helpers/stores';
    const key: string = `drop-group-${dropGroupId.next()}`;
    let sourceResult:
        | {
              item: Item;
              listSnapshot: Item[];
              dropZoneId: number;
          }
        | undefined = undefined;
    let destinationResult:
        | {
              item: Item;
              index: number;
              insertedAfter: Item | undefined;
              listSnapshot: Item[];
              dropZoneId: number;
          }
        | undefined = undefined;
    const dispatch = createEventDispatcher();
    const onDragStart = () => {
        sourceResult = undefined;
        destinationResult = undefined;
    };
    const onDragComplete = () => {
        dispatch('dragcomplete', {
            sourceResult,
            destinationResult: destinationResult!,
        });
        sourceResult = undefined;
        destinationResult = undefined;
    };
    const onDropIn = (
        item: Item,
        index: number,
        insertedAfter: Item | undefined,
        listSnapshot: Item[],
        sourceDropZoneId: number,
        destinationDropZoneId: number
    ) => {
        destinationResult = {
            item,
            index,
            insertedAfter,
            listSnapshot,
            dropZoneId: destinationDropZoneId,
        };
        if (!!sourceResult || sourceDropZoneId === destinationDropZoneId) {
            onDragComplete();
        }
    };
    const onDragOut = (
        item: Item,
        listSnapshot: Item[],
        sourceDropZoneId: number
    ) => {
        sourceResult = { item, listSnapshot, dropZoneId: sourceDropZoneId };
        if (!!destinationResult) {
            onDragComplete();
        }
    };
    const onDragCancel = (item: Item) => {
        dispatch('dragcancelled', {
            item,
        });
        sourceResult = undefined;
        destinationResult = undefined;
    };
    const dropGroup: DropGroup = {
        key,
        onDragStart,
        onDropIn,
        onDragOut,
        onDragCancel,
    };
    setContext('reactive-drop-group', dropGroup);
</script>

<slot />

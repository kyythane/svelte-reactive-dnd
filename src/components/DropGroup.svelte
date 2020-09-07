<script lang="ts">
    import { setContext, createEventDispatcher } from 'svelte';
    import type { Id, DropGroup, Item } from '../helpers/types';
    import { dropGroupId } from '../helpers/stores';
    const key: string = `drop-group-${dropGroupId.next()}`;
    let sourceResult:
        | {
              item: Item;
              listSnapshot: Item[];
              listIdentifier: Id;
          }
        | undefined = undefined;
    let destinationResult:
        | {
              item: Item;
              index: number;
              insertedAfter: Item | undefined;
              listSnapshot: Item[];
              listIdentifier: Id;
          }
        | undefined = undefined;
    const dispatch = createEventDispatcher();
    const onDragStart = (item: Item, sourceIdentifer: Id) => {
        sourceResult = undefined;
        destinationResult = undefined;
        dispatch('dragstart', {
            item,
            listIdentifier: sourceIdentifer,
        });
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
        sourceIdentifier: Id,
        destinationIdentifier: Id
    ) => {
        destinationResult = {
            item,
            index,
            insertedAfter,
            listSnapshot,
            listIdentifier: destinationIdentifier,
        };
        if (!!sourceResult || sourceIdentifier === destinationIdentifier) {
            onDragComplete();
        }
    };
    const onDragOut = (
        item: Item,
        listSnapshot: Item[],
        sourceIdentifier: Id
    ) => {
        sourceResult = { item, listSnapshot, listIdentifier: sourceIdentifier };
        if (!!destinationResult) {
            onDragComplete();
        }
    };
    const onDragCancel = (item: Item, sourceIdentifer: Id) => {
        dispatch('dragcancelled', {
            item,
            listIdentifier: sourceIdentifer,
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

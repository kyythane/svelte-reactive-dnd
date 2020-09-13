<style>
    .default {
        cursor: grab;
    }

    .disabled {
        cursor: not-allowed;
    }
</style>

<script lang="ts">
    import type { Id, DropTarget, DragEventHandlers } from '../helpers/types';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';

    export let itemId: Id;
    export let disabled: boolean = false;
    export let dragEventHandlers: DragEventHandlers | undefined;

    const dropZone = getContext('reactive-drop-list') as
        | Writable<DropTarget>
        | undefined;

    let currentEventHandlers: DragEventHandlers | undefined;

    $: {
        if (!!dragEventHandlers) {
            currentEventHandlers = dragEventHandlers;
        } else {
            if ($dropZone?.hasItem(itemId)) {
                currentEventHandlers = $dropZone.getEventHandlers();
            }
        }
    }
</script>

<!--The id is used by DropList to set the cursor on its clone of the DragHandle's Elements-->
<div
    id="{`reactive-dnd-drag-handle-${itemId}`}"
    on:mousedown="{(event) => {
        if (!disabled && !!currentEventHandlers) {
            currentEventHandlers.handleMouseDown(event, itemId);
        }
    }}"
    on:mouseup="{(event) => {
        if (!!currentEventHandlers) {
            currentEventHandlers.handleMouseUp(event);
        }
    }}"
    on:mousemove="{(event) => {
        if (!!currentEventHandlers) {
            currentEventHandlers.handleMouseMove(event);
        }
    }}"
    class="{!dropZone || $dropZone.disabled() || disabled ? 'disabled' : 'default'}"
>
    <slot />
</div>

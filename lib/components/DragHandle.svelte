<style>
    .default {
        cursor: grab;
    }

    .disabled {
        cursor: not-allowed;
    }
</style>

<script lang="ts">
    import type { Id, DropTarget } from '../helpers/types';
    import { dropTargets } from '../helpers/stores';

    export let itemId: Id;
    export let disabled: boolean = false;

    let dropZone: DropTarget | undefined;

    $: {
        // This is fairly naive, but in 95% of cases it should be "fine"
        dropZone = $dropTargets.find((target) => target.hasItem(itemId));
    }
</script>

<!--The id is used by DropList to set the cursor on its clone of the DragHandle's Elements-->
<div
    id="{`reactive-dnd-drag-handle-${itemId}`}"
    on:mousedown="{(event) => {
        if (!disabled && !!dropZone) {
            dropZone.getEventHandlers().handleMouseDown(event, itemId);
        }
    }}"
    on:mouseup="{(event) => {
        if (!!dropZone) {
            dropZone.getEventHandlers().handleMouseUp(event);
        }
    }}"
    on:mousemove="{(event) => {
        if (!!dropZone) {
            dropZone.getEventHandlers().handleMouseMove(event);
        }
    }}"
    class="{disabled ? 'disabled' : 'default'}"
>
    <slot />
</div>

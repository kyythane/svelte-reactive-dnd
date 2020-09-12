<style>
    .horiz {
        display: flex;
        justify-content: space-evenly;
    }
</style>

<script>
    import DropGroup from '../lib/components/DropGroup.svelte';
    import List from './List.svelte';
    let items = [
        [
            { id: 1, title: 'Apple' },
            { id: 2, title: 'Banana' },
            { id: 3, title: 'Cherry' },
        ],
        [
            { id: 4, title: 'Grape' },
            { id: 5, title: 'Kiwi' },
            { id: 6, title: 'Lime' },
            { id: 7, title: 'Orange' },
            { id: 8, title: 'Pear' },
        ],
        [
            { id: 9, title: 'Melon' },
            { id: 10, title: 'Star fruit' },
        ],
    ];

    const onDragComplete = ({ detail }) => {
        const cloned = [...items];
        if (!!detail.sourceResult) {
            cloned[detail.sourceResult.listIdentifier] =
                detail.sourceResult.listSnapshot;
        }
        cloned[detail.destinationResult.listIdentifier] =
            detail.destinationResult.listSnapshot;
        items = cloned;
    };
</script>

<!-- Creates 4 lists. 3 are part of the parent drop group, one has a different key and is not -->
<DropGroup on:dragcomplete="{onDragComplete}">
    <div class="horiz">
        <List identifier="{0}" items="{items[0]}" />
        <List identifier="{1}" items="{items[1]}" />
        <List identifier="{2}" items="{items[2]}" />
    </div>
</DropGroup>

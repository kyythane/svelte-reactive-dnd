<style>
    .horiz {
        display: flex;
        justify-content: space-evenly;
    }
</style>

<script>
    import DropGroup from '../lib/components/DropGroup.svelte';
    import List from './List.svelte';

    export let mode = 'single';
    let items;
    if (mode === 'single') {
        items = [
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
    } else {
        items = [
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
                { id: 1, title: 'Lipstick' },
                { id: 2, title: 'Eyeshadow' },
            ],
            [
                { id: 3, title: 'Toner' },
                { id: 4, title: 'Foundation' },
                { id: 5, title: 'Powder' },
            ],
        ];
    }

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

{#if mode === 'single'}
    <DropGroup on:dragcomplete="{onDragComplete}">
        <div class="horiz">
            <List identifier="{0}" items="{items[0]}" />
            <List identifier="{1}" items="{items[1]}" />
            <List identifier="{2}" items="{items[2]}" />
        </div>
    </DropGroup>
{:else}
    <div class="horiz">
        <DropGroup on:dragcomplete="{onDragComplete}">
            <div class="horiz">
                <List identifier="{0}" items="{items[0]}" />
                <List identifier="{1}" items="{items[1]}" />
            </div>
        </DropGroup>
        <DropGroup on:dragcomplete="{onDragComplete}">
            <div class="horiz">
                <List identifier="{2}" items="{items[2]}" />
                <List identifier="{3}" items="{items[3]}" />
            </div>
        </DropGroup>
    </div>
{/if}

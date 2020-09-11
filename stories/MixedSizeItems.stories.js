import MixedSizeItems from './MixedSizeItems.svelte';

export default {
    title: 'Lists/MixedSizeItems',
    component: MixedSizeItems,
    argTypes: {
        minSize: {
            control: { type: 'range', min: 20, max: 40, step: 1 },
        },
        maxSize: {
            control: { type: 'range', min: 40, max: 200, step: 1 },
        },
        seed: { control: 'number' },
        numItems: { control: 'number' },
        direction: {
            control: {
                type: 'inline-radio',
                options: ['horizontal', 'vertical'],
            },
        },
        crossingMode: {
            control: {
                type: 'inline-radio',
                options: ['edge', 'center'],
            },
        },
    },
};

const Template = ({ ...args }) => ({
    Component: MixedSizeItems,
    props: args,
});

export const Basic = Template.bind({});
Basic.args = {
    seed: Math.trunc(Math.random() * 100000),
    minSize: 30,
    maxSize: 80,
    direction: 'vertical',
    numItems: 5,
    crossingMode: 'edge',
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    seed: Math.trunc(Math.random() * 100000),
    minSize: 30,
    maxSize: 80,
    direction: 'horizontal',
    numItems: 5,
    crossingMode: 'edge',
};

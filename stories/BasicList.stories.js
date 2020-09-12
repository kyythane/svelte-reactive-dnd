import BasicList from './BasicList.svelte';

export default {
    title: 'Lists/BasicList',
    component: BasicList,
    argTypes: {
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
        disableDropSpacing: { control: 'boolean' },
        disableSourceShrinking: { control: 'boolean' },
    },
};

const Template = ({ ...args }) => ({
    Component: BasicList,
    props: args,
});

export const Vertical = Template.bind({});
Vertical.args = {
    direction: 'vertical',
    numItems: 5,
    crossingMode: 'edge',
    disableDropSpacing: false,
    disableSourceShrinking: false,
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    direction: 'horizontal',
    numItems: 5,
    crossingMode: 'edge',
    disableDropSpacing: false,
    disableSourceShrinking: false,
};

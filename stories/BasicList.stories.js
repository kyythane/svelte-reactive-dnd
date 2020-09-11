import SingleList from './BasicList.svelte';

export default {
    title: 'Lists/BasicList',
    component: SingleList,
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
    },
};

const Template = ({ ...args }) => ({
    Component: SingleList,
    props: args,
});

export const Basic = Template.bind({});
Basic.args = {
    direction: 'vertical',
    numItems: 5,
    crossingMode: 'edge',
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    direction: 'horizontal',
    numItems: 5,
    crossingMode: 'edge',
};

import SingleList from './SingleList.svelte';

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
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    direction: 'horizontal',
    numItems: 5,
};

import HorizontalList from './SingleList.svelte';

export default {
    title: 'Lists/SingleList',
    component: HorizontalList,
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
    Component: HorizontalList,
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

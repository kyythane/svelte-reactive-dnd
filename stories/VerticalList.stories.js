import VerticalList from './VerticalList.svelte';

export default {
    title: 'Example/VerticalList',
    component: VerticalList,
    argTypes: {
        numItems: { control: 'number' },
    },
};

const Template = ({ ...args }) => ({
    Component: VerticalList,
    props: args,
});

export const Basic = Template.bind({});
Basic.args = {
    numItems: 5,
};

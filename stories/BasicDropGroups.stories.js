import BasicDropGroups from './BasicDropGroups.svelte';

export default {
    title: 'Groups/Basic',
    component: BasicDropGroups,
    argTypes: {},
};

const Template = ({ ...args }) => ({
    Component: BasicDropGroups,
    props: args,
});

export const Vertical = Template.bind({});
Vertical.args = {};

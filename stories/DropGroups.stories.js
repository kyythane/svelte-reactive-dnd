import BasicDropGroups from './BasicDropGroups.svelte';

export default {
    title: 'Groups/Basic',
    component: BasicDropGroups,
    argTypes: {
        mode: {
            type: 'inline-radio',
            options: ['single', 'multiple'],
        },
    },
};

const BasicTemplate = ({ ...args }) => ({
    Component: BasicDropGroups,
    props: args,
});

export const Single = BasicTemplate.bind({});
Single.args = {
    mode: 'single',
};

export const Neighboring = BasicTemplate.bind({});
Neighboring.args = {
    mode: 'multiple',
};

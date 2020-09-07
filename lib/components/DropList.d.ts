import type { Item } from '../helpers/types';
declare const DropList__SvelteComponent__base: AConstructorTypeOf<Svelte2TsxComponent<Partial<{
    items: Item[];
    key?: string;
    capacity?: number;
    disabled?: boolean;
    disableScrollOnDrag?: boolean;
    disableDropSpacing?: boolean;
    enableResizeListeners?: boolean;
    direction?: "horizontal" | "vertical";
    allowDrop?: (item: Item, sourceDropZone: number) => boolean;
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    listItem: {
        data: {
            item: unknown;
            isDraggingOver: boolean;
            dragEventHandlers: {
                handleMouseDown: (event: MouseEvent, id: string | number, delayedEvent?: (event: MouseEvent) => void) => void;
                handleMouseUp: () => void;
                handleMouseMove: (event: MouseEvent) => Promise<void>;
            };
        };
    };
}>>;
export default class DropList__SvelteComponent_ extends DropList__SvelteComponent__base {
    get id(): number;
}
export {};

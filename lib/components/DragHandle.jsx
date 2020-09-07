var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference types="svelte" />
<></>;
import { dropTargets } from '../helpers/stores';
function render() {
    var itemId;
    var disabled = false;
    disabled = __sveltets_any(disabled);
    ;
    var dropZone;
    ;
    (function () {
        $: {
            // This is fairly naive, but in 95% of cases it should be "fine"
            dropZone = __sveltets_store_get(dropTargets).find(function (target) { return target.hasItem(itemId); });
        }
    });
    (function () { return (<>




    <div id={"reactive-dnd-drag-handle-" + itemId} onmousedown={function (event) {
        if (!disabled && !!dropZone) {
            dropZone.getEventHandlers().handleMouseDown(event, itemId);
        }
    }} onmouseup={function (event) {
        if (!!dropZone) {
            dropZone.getEventHandlers().handleMouseUp(event);
        }
    }} onmousemove={function (event) {
        if (!!dropZone) {
            dropZone.getEventHandlers().handleMouseMove(event);
        }
    }} class={disabled ? 'disabled' : 'default'}>
    <slot />
    </div></>); });
    return { props: { itemId: itemId, disabled: disabled }, slots: { 'default': {} }, getters: {}, events: {} };
}
var DragHandle__SvelteComponent_ = /** @class */ (function (_super) {
    __extends(DragHandle__SvelteComponent_, _super);
    function DragHandle__SvelteComponent_() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DragHandle__SvelteComponent_;
}(createSvelte2TsxComponent(__sveltets_partial(__sveltets_with_any_event(render)))));
export default DragHandle__SvelteComponent_;

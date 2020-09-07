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
import { setContext, createEventDispatcher } from 'svelte';
import { dropGroupId } from '../helpers/stores';
function render() {
    var key = "drop-group-" + dropGroupId.next();
    var sourceResult = undefined;
    var destinationResult = undefined;
    var dispatch = createEventDispatcher();
    var onDragStart = function () {
        sourceResult = undefined;
        destinationResult = undefined;
    };
    var onDragComplete = function () {
        dispatch('dragcomplete', {
            sourceResult: sourceResult,
            destinationResult: destinationResult
        });
        sourceResult = undefined;
        destinationResult = undefined;
    };
    var onDropIn = function (item, index, insertedAfter, listSnapshot, sourceDropZoneId, destinationDropZoneId) {
        destinationResult = {
            item: item,
            index: index,
            insertedAfter: insertedAfter,
            listSnapshot: listSnapshot,
            dropZoneId: destinationDropZoneId
        };
        if (!!sourceResult || sourceDropZoneId === destinationDropZoneId) {
            onDragComplete();
        }
    };
    var onDragOut = function (item, listSnapshot, sourceDropZoneId) {
        sourceResult = { item: item, listSnapshot: listSnapshot, dropZoneId: sourceDropZoneId };
        if (!!destinationResult) {
            onDragComplete();
        }
    };
    var onDragCancel = function (item) {
        dispatch('dragcancelled', {
            item: item
        });
        sourceResult = undefined;
        destinationResult = undefined;
    };
    var dropGroup = {
        key: key,
        onDragStart: onDragStart,
        onDropIn: onDropIn,
        onDragOut: onDragOut,
        onDragCancel: onDragCancel
    };
    setContext('reactive-drop-group', dropGroup);
    ;
    (function () { return (<>

    <slot /></>); });
    return { props: {}, slots: { 'default': {} }, getters: {}, events: {} };
}
var DropGroup__SvelteComponent_ = /** @class */ (function (_super) {
    __extends(DropGroup__SvelteComponent_, _super);
    function DropGroup__SvelteComponent_() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DropGroup__SvelteComponent_;
}(createSvelte2TsxComponent(__sveltets_partial(__sveltets_with_any_event(render)))));
export default DropGroup__SvelteComponent_;

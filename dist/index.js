(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ReactiveDnd = {}));
}(this, (function (exports) { 'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const dragDropSettings = writable({
        defaults: {
            disableScrollOnDrag: false,
            disableDropSpacing: false,
            enableResizeListeners: false,
            direction: 'vertical',
        },
        dragThresholdPixels: 25,
        animationMs: 200,
        scrollOnDragThresholdPercent: 0.1,
        scrollOnDragMinPixels: 50,
        scrollOnDragMaxPixels: 150,
        minDragScrollSpeed: 75,
        maxDragScrollSpeed: 175,
    });
    const dropTargets = writable([]);
    const dragging = writable('none');
    const dragTarget = writable(undefined);
    function getKeysForDirection(direction) {
        return {
            scrollKey: direction === 'vertical' ? 'scrollTop' : 'scrollLeft',
            dimensionKey: direction === 'vertical' ? 'height' : 'width',
            paddingKeys: direction === 'vertical'
                ? { before: 'paddingTop', after: 'paddingBottom' }
                : { before: 'paddingLeft', after: 'paddingRight' },
        };
    }
    function createDropTargetCache(initialState) {
        const { subscribe, set } = writable(Object.assign(Object.assign({}, initialState), getKeysForDirection(initialState.direction)));
        return {
            subscribe,
            set: ({ items, direction, }) => {
                set(Object.assign({ items,
                    direction }, getKeysForDirection(initialState.direction)));
            },
        };
    }
    function createAutoIncrementingId() {
        const { subscribe, update } = writable(0);
        return {
            subscribe,
            next: () => {
                let curr = 0;
                update((n) => {
                    curr = n;
                    return n + 1;
                });
                return curr;
            },
        };
    }
    const dropTargetId = createAutoIncrementingId();
    const dropGroupId = createAutoIncrementingId();

    /* src/components/DragHandle.svelte generated by Svelte v3.24.1 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1ctva-style";
    	style.textContent = ".default.svelte-1ctva{cursor:grab}.disabled.svelte-1ctva{cursor:not-allowed}";
    	append(document.head, style);
    }

    function create_fragment(ctx) {
    	let div;
    	let div_id_value;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr(div, "id", div_id_value = `reactive-dnd-drag-handle-${/*itemId*/ ctx[0]}`);
    			attr(div, "class", div_class_value = "" + (null_to_empty(/*disabled*/ ctx[1] ? "disabled" : "default") + " svelte-1ctva"));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div, "mousedown", /*mousedown_handler*/ ctx[5]),
    					listen(div, "mouseup", /*mouseup_handler*/ ctx[6]),
    					listen(div, "mousemove", /*mousemove_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*itemId*/ 1 && div_id_value !== (div_id_value = `reactive-dnd-drag-handle-${/*itemId*/ ctx[0]}`)) {
    				attr(div, "id", div_id_value);
    			}

    			if (!current || dirty & /*disabled*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*disabled*/ ctx[1] ? "disabled" : "default") + " svelte-1ctva"))) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $dropTargets;
    	component_subscribe($$self, dropTargets, $$value => $$invalidate(8, $dropTargets = $$value));
    	
    	let { itemId } = $$props;
    	let { disabled = false } = $$props;
    	let dropZone;
    	let { $$slots = {}, $$scope } = $$props;

    	const mousedown_handler = event => {
    		if (!disabled && !!dropZone) {
    			dropZone.getEventHandlers().handleMouseDown(event, itemId);
    		}
    	};

    	const mouseup_handler = event => {
    		if (!!dropZone) {
    			dropZone.getEventHandlers().handleMouseUp(event);
    		}
    	};

    	const mousemove_handler = event => {
    		if (!!dropZone) {
    			dropZone.getEventHandlers().handleMouseMove(event);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ("itemId" in $$props) $$invalidate(0, itemId = $$props.itemId);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dropTargets, itemId*/ 257) {
    			 {
    				// This is fairly naive, but in 95% of cases it should be "fine"
    				$$invalidate(2, dropZone = $dropTargets.find(target => target.hasItem(itemId)));
    			}
    		}
    	};

    	return [
    		itemId,
    		disabled,
    		dropZone,
    		$$scope,
    		$$slots,
    		mousedown_handler,
    		mouseup_handler,
    		mousemove_handler
    	];
    }

    class DragHandle extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1ctva-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { itemId: 0, disabled: 1 });
    	}
    }

    /* src/components/DropGroup.svelte generated by Svelte v3.24.1 */

    function create_fragment$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
    	const key = `drop-group-${dropGroupId.next()}`;
    	let sourceResult = undefined;
    	let destinationResult = undefined;
    	const dispatch = createEventDispatcher();

    	const onDragStart = () => {
    		sourceResult = undefined;
    		destinationResult = undefined;
    	};

    	const onDragComplete = () => {
    		dispatch("dragcomplete", { sourceResult, destinationResult });
    		sourceResult = undefined;
    		destinationResult = undefined;
    	};

    	const onDropIn = (item, index, insertedAfter, listSnapshot, sourceDropZoneId, destinationDropZoneId) => {
    		destinationResult = {
    			item,
    			index,
    			insertedAfter,
    			listSnapshot,
    			dropZoneId: destinationDropZoneId
    		};

    		if (!!sourceResult || sourceDropZoneId === destinationDropZoneId) {
    			onDragComplete();
    		}
    	};

    	const onDragOut = (item, listSnapshot, sourceDropZoneId) => {
    		sourceResult = {
    			item,
    			listSnapshot,
    			dropZoneId: sourceDropZoneId
    		};

    		if (!!destinationResult) {
    			onDragComplete();
    		}
    	};

    	const onDragCancel = item => {
    		dispatch("dragcancelled", { item });
    		sourceResult = undefined;
    		destinationResult = undefined;
    	};

    	const dropGroup = {
    		key,
    		onDragStart,
    		onDropIn,
    		onDragOut,
    		onDragCancel
    	};

    	setContext("reactive-drop-group", dropGroup);
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class DropGroup extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    function makeDraggableElement(originalElement, id) {
        const rect = originalElement.getBoundingClientRect();
        const draggedEl = originalElement.cloneNode(true);
        draggedEl.id = `reactive-dnd-drag-placeholder`;
        draggedEl.style.position = 'fixed';
        draggedEl.style.top = `${rect.top}px`;
        draggedEl.style.left = `${rect.left}px`;
        draggedEl.style.zIndex = '9999';
        draggedEl.style.cursor = 'grabbing';
        const dragHandle = draggedEl.querySelector(`#reactive-dnd-drag-handle-${id}`);
        if (!!dragHandle) {
            dragHandle.style.cursor = 'grabbing';
        }
        return draggedEl;
    }
    function overlap(rect1, rect2) {
        return !(rect1.x + rect1.width < rect2.x ||
            rect1.y + rect1.height < rect2.y ||
            rect2.x + rect2.width < rect1.x ||
            rect2.y + rect2.height < rect1.y);
    }
    function percentOverlap(rect1, rect2) {
        const maxX = Math.min(rect1.width + rect1.x, rect2.width + rect2.x);
        const minX = Math.max(rect1.x, rect2.x);
        const maxY = Math.min(rect1.height + rect1.y, rect2.height + rect2.y);
        const minY = Math.max(rect1.y, rect2.y);
        return {
            overlapX: Math.max(maxX - minX, 0) / rect1.width,
            overlapY: Math.max(maxY - minY, 0) / rect1.height,
        };
    }
    function computeMidpoint(rect) {
        return { x: rect.width / 2 + rect.x, y: rect.height / 2 + rect.y };
    }
    function removePaddingFromRect(element, rect) {
        const top = pixelStringToNumber(element.style.paddingTop);
        const left = pixelStringToNumber(element.style.paddingLeft);
        const right = pixelStringToNumber(element.style.paddingRight);
        const bottom = pixelStringToNumber(element.style.paddingBottom);
        return {
            x: rect.x + left,
            y: rect.y + top,
            width: rect.width - (left + right),
            height: rect.height - (top + bottom),
        };
    }
    function pixelStringToNumber(pixelString) {
        return pixelString && pixelString.length > 0
            ? Number.parseFloat(pixelString.substring(0, pixelString.length - 2))
            : 0;
    }
    function removePaddingFromHoverResult(result) {
        result.element.style.paddingTop = '';
        result.element.style.paddingBottom = '';
        result.element.style.paddingLeft = '';
        result.element.style.paddingRight = '';
    }
    function updateContainingStyleSize(containingElement, direction, amount) {
        if (direction === 'horizontal') {
            containingElement.style.width = `${amount}px`;
        }
        else {
            containingElement.style.height = `${amount}px`;
        }
    }
    function calculatePlacement(rectA, rectB, direction) {
        const key = direction === 'horizontal' ? 'x' : 'y';
        return computeMidpoint(rectA)[key] > computeMidpoint(rectB)[key]
            ? 'before'
            : 'after';
    }
    function growOrShrinkRectInList(rects, startIndex, offset) {
        const newRects = [...rects];
        const toResize = newRects[startIndex];
        if (!toResize || !offset) {
            console.log(toResize, rects, startIndex, offset);
        }
        newRects[startIndex] = {
            x: toResize.x,
            y: toResize.y,
            width: toResize.width + offset.x,
            height: toResize.height + offset.y,
        };
        for (let i = startIndex + 1; i < newRects.length; i++) {
            newRects[i] = translateRectBy(newRects[i], offset);
        }
        return newRects;
    }
    function translateRectsBy(rects, startIndex, offset) {
        const newRects = [...rects];
        for (let i = startIndex; i < newRects.length; i++) {
            newRects[i] = translateRectBy(newRects[i], offset);
        }
        return newRects;
    }
    function translateRectBy(rect, offset) {
        return moveRectTo(rect, { x: rect.x + offset.x, y: rect.y + offset.y });
    }
    function moveRectTo({ width, height }, { x, y }) {
        return { x, y, width, height };
    }
    function clamp(num, min = 0, max = 1) {
        return Math.max(min, Math.min(max, num));
    }
    function lerp(percent, min, max) {
        return clamp(percent) * (max - min) + min;
    }

    /* src/components/DropList.svelte generated by Svelte v3.24.1 */

    const get_listItem_slot_changes_1 = dirty => ({
    	data: dirty[0] & /*$cache, currentlyDraggingOver*/ 2080
    });

    const get_listItem_slot_context_1 = ctx => ({
    	data: {
    		item: /*item*/ ctx[73],
    		isDraggingOver: !!/*currentlyDraggingOver*/ ctx[5] && /*currentlyDraggingOver*/ ctx[5].item.id === /*item*/ ctx[73].id,
    		dragEventHandlers: {
    			handleMouseDown: /*handleDraggableMouseDown*/ ctx[15],
    			handleMouseUp: /*handleDraggableMouseUp*/ ctx[16],
    			handleMouseMove: /*handleDraggableMouseMove*/ ctx[17]
    		}
    	}
    });

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[73] = list[i];
    	child_ctx[76] = list;
    	child_ctx[77] = i;
    	return child_ctx;
    }

    const get_listItem_slot_changes = dirty => ({
    	data: dirty[0] & /*$cache, currentlyDraggingOver*/ 2080
    });

    const get_listItem_slot_context = ctx => ({
    	data: {
    		item: /*item*/ ctx[73],
    		isDraggingOver: !!/*currentlyDraggingOver*/ ctx[5] && /*currentlyDraggingOver*/ ctx[5].item.id === /*item*/ ctx[73].id,
    		dragEventHandlers: {
    			handleMouseDown: /*handleDraggableMouseDown*/ ctx[15],
    			handleMouseUp: /*handleDraggableMouseUp*/ ctx[16],
    			handleMouseMove: /*handleDraggableMouseMove*/ ctx[17]
    		}
    	}
    });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[73] = list[i];
    	child_ctx[74] = list;
    	child_ctx[75] = i;
    	return child_ctx;
    }

    // (729:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let each_value_1 = /*$cache*/ ctx[11].items;
    	const get_key = ctx => /*item*/ ctx[73].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", div_class_value = `dropContainer ${/*$cache*/ ctx[11].direction === "horizontal"
			? "horizontal"
			: "vertical"}`);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_3*/ ctx[33](div);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*wrappingElements, $cache, $$scope, currentlyDraggingOver, handleDraggableMouseDown, handleDraggableMouseUp, handleDraggableMouseMove*/ 134449186) {
    				const each_value_1 = /*$cache*/ ctx[11].items;
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*$cache*/ 2048 && div_class_value !== (div_class_value = `dropContainer ${/*$cache*/ ctx[11].direction === "horizontal"
			? "horizontal"
			: "vertical"}`)) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div_binding_3*/ ctx[33](null);
    		}
    	};
    }

    // (713:0) {#if enableResizeListeners}
    function create_if_block(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let each_value = /*$cache*/ ctx[11].items;
    	const get_key = ctx => /*item*/ ctx[73].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", div_class_value = `dropContainer ${/*$cache*/ ctx[11].direction === "horizontal"
			? "horizontal"
			: "vertical"}`);

    			add_render_callback(() => /*div_elementresize_handler*/ ctx[31].call(div));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_1*/ ctx[30](div);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[31].bind(div));
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*wrappingElements, $cache, $$scope, currentlyDraggingOver, handleDraggableMouseDown, handleDraggableMouseUp, handleDraggableMouseMove*/ 134449186) {
    				const each_value = /*$cache*/ ctx[11].items;
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*$cache*/ 2048 && div_class_value !== (div_class_value = `dropContainer ${/*$cache*/ ctx[11].direction === "horizontal"
			? "horizontal"
			: "vertical"}`)) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div_binding_1*/ ctx[30](null);
    			div_resize_listener();
    		}
    	};
    }

    // (734:8) {#each $cache.items as item (item.id)}
    function create_each_block_1(key_2, ctx) {
    	let div;
    	let t;
    	let item = /*item*/ ctx[73];
    	let current;
    	const listItem_slot_template = /*$$slots*/ ctx[28].listItem;
    	const listItem_slot = create_slot(listItem_slot_template, ctx, /*$$scope*/ ctx[27], get_listItem_slot_context_1);
    	const assign_div = () => /*div_binding_2*/ ctx[32](div, item);
    	const unassign_div = () => /*div_binding_2*/ ctx[32](null, item);

    	return {
    		key: key_2,
    		first: null,
    		c() {
    			div = element("div");
    			if (listItem_slot) listItem_slot.c();
    			t = space();
    			attr(div, "class", "dragContainer");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (listItem_slot) {
    				listItem_slot.m(div, null);
    			}

    			append(div, t);
    			assign_div();
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (listItem_slot) {
    				if (listItem_slot.p && dirty[0] & /*$$scope, $cache, currentlyDraggingOver*/ 134219808) {
    					update_slot(listItem_slot, listItem_slot_template, ctx, /*$$scope*/ ctx[27], dirty, get_listItem_slot_changes_1, get_listItem_slot_context_1);
    				}
    			}

    			if (item !== /*item*/ ctx[73]) {
    				unassign_div();
    				item = /*item*/ ctx[73];
    				assign_div();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(listItem_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(listItem_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (listItem_slot) listItem_slot.d(detaching);
    			unassign_div();
    		}
    	};
    }

    // (720:8) {#each $cache.items as item (item.id)}
    function create_each_block(key_2, ctx) {
    	let div;
    	let t;
    	let item = /*item*/ ctx[73];
    	let current;
    	const listItem_slot_template = /*$$slots*/ ctx[28].listItem;
    	const listItem_slot = create_slot(listItem_slot_template, ctx, /*$$scope*/ ctx[27], get_listItem_slot_context);
    	const assign_div = () => /*div_binding*/ ctx[29](div, item);
    	const unassign_div = () => /*div_binding*/ ctx[29](null, item);

    	return {
    		key: key_2,
    		first: null,
    		c() {
    			div = element("div");
    			if (listItem_slot) listItem_slot.c();
    			t = space();
    			attr(div, "class", "dragContainer");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (listItem_slot) {
    				listItem_slot.m(div, null);
    			}

    			append(div, t);
    			assign_div();
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (listItem_slot) {
    				if (listItem_slot.p && dirty[0] & /*$$scope, $cache, currentlyDraggingOver*/ 134219808) {
    					update_slot(listItem_slot, listItem_slot_template, ctx, /*$$scope*/ ctx[27], dirty, get_listItem_slot_changes, get_listItem_slot_context);
    				}
    			}

    			if (item !== /*item*/ ctx[73]) {
    				unassign_div();
    				item = /*item*/ ctx[73];
    				assign_div();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(listItem_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(listItem_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (listItem_slot) listItem_slot.d(detaching);
    			unassign_div();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*enableResizeListeners*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window, "mousemove", /*moveDraggable*/ ctx[13]),
    					listen(window, "mouseup", /*endDrag*/ ctx[14]),
    					listen(window, "mouseleave", /*endDrag*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $dragDropSettings;
    	let $dragTarget;
    	let $dragging;

    	let $dragTween,
    		$$unsubscribe_dragTween = noop,
    		$$subscribe_dragTween = () => ($$unsubscribe_dragTween(), $$unsubscribe_dragTween = subscribe(dragTween, $$value => $$invalidate(50, $dragTween = $$value)), dragTween);

    	let $cache;
    	let $dropTargets;

    	let $hoverLeaveElementTweens,
    		$$unsubscribe_hoverLeaveElementTweens = noop,
    		$$subscribe_hoverLeaveElementTweens = () => ($$unsubscribe_hoverLeaveElementTweens(), $$unsubscribe_hoverLeaveElementTweens = subscribe(hoverLeaveElementTweens, $$value => $$invalidate(52, $hoverLeaveElementTweens = $$value)), hoverLeaveElementTweens);

    	let $hoverEnterElementTween,
    		$$unsubscribe_hoverEnterElementTween = noop,
    		$$subscribe_hoverEnterElementTween = () => ($$unsubscribe_hoverEnterElementTween(), $$unsubscribe_hoverEnterElementTween = subscribe(hoverEnterElementTween, $$value => $$invalidate(53, $hoverEnterElementTween = $$value)), hoverEnterElementTween);

    	let $sourceElementTween,
    		$$unsubscribe_sourceElementTween = noop,
    		$$subscribe_sourceElementTween = () => ($$unsubscribe_sourceElementTween(), $$unsubscribe_sourceElementTween = subscribe(sourceElementTween, $$value => $$invalidate(54, $sourceElementTween = $$value)), sourceElementTween);

    	let $dragScrollTween,
    		$$unsubscribe_dragScrollTween = noop,
    		$$subscribe_dragScrollTween = () => ($$unsubscribe_dragScrollTween(), $$unsubscribe_dragScrollTween = subscribe(dragScrollTween, $$value => $$invalidate(55, $dragScrollTween = $$value)), dragScrollTween);

    	component_subscribe($$self, dragDropSettings, $$value => $$invalidate(47, $dragDropSettings = $$value));
    	component_subscribe($$self, dragTarget, $$value => $$invalidate(48, $dragTarget = $$value));
    	component_subscribe($$self, dragging, $$value => $$invalidate(49, $dragging = $$value));
    	component_subscribe($$self, dropTargets, $$value => $$invalidate(51, $dropTargets = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_dragTween());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_hoverLeaveElementTweens());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_hoverEnterElementTween());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_sourceElementTween());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_dragScrollTween());

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	
    	let { items } = $$props;
    	let { key = undefined } = $$props;
    	let { capacity = Number.POSITIVE_INFINITY } = $$props;
    	let { disabled = false } = $$props;
    	let { disableScrollOnDrag = $dragDropSettings.defaults.disableScrollOnDrag } = $$props;
    	let { disableDropSpacing = $dragDropSettings.defaults.disableDropSpacing } = $$props;
    	let { enableResizeListeners = $dragDropSettings.defaults.enableResizeListeners } = $$props;
    	let { direction = $dragDropSettings.defaults.direction } = $$props;
    	let { allowDrop = () => true } = $$props;
    	const id = dropTargetId.next();
    	const dropGroup = getContext("reactive-drop-group");
    	const cache = createDropTargetCache({ items: [], direction });
    	component_subscribe($$self, cache, value => $$invalidate(11, $cache = value));
    	let cachedRects = [];
    	let cachedDropZoneRect;
    	let cachedDisplay;
    	let wrappingElements = {};
    	let dropZone;
    	let currentWidth = 0;
    	let currentHeight = 0;
    	let mounted = false;
    	let potentiallDraggedId = undefined;
    	let currentlyDraggingOver = undefined;
    	let previouslyDraggedOver = [];
    	let draggableDragStart = undefined;
    	let handleDelayedEvent;

    	// Tweened isn't exported, so use Writable since it is _mostly_ correct
    	let dragTween = undefined;

    	$$subscribe_dragTween();
    	let sourceElementTween = undefined;
    	$$subscribe_sourceElementTween();
    	let hoverEnterElementTween = undefined;
    	$$subscribe_hoverEnterElementTween();
    	let hoverLeaveElementTweens = undefined;
    	$$subscribe_hoverLeaveElementTweens();
    	let dragScrollTween = undefined;
    	$$subscribe_dragScrollTween();
    	let dragScrollTarget;
    	let dragScrollCurrent;
    	let currentDropTarget = undefined;

    	let hierarchyKey = key !== null && key !== void 0
    	? key
    	: dropGroup === null || dropGroup === void 0
    		? void 0
    		: dropGroup.key;

    	let active = false;
    	const dispatch = createEventDispatcher();

    	const moveDraggable = event => {
    		if (($dragTarget === null || $dragTarget === void 0
    		? void 0
    		: $dragTarget.controllingDropZoneId) === id && ($dragging === "picking-up" || $dragging === "dragging")) {
    			event.preventDefault();

    			set_store_value(dragTween, $dragTween = {
    				x: event.clientX - draggableDragStart.x,
    				y: event.clientY - draggableDragStart.y
    			});
    		}
    	};

    	const cleanupAfterDrag = () => {
    		set_store_value(dragging, $dragging = "none");
    		document.body.removeChild($dragTarget.dragElement);
    		let containingElement = wrappingElements[$dragTarget.item.id];
    		containingElement.style[$cache.dimensionKey] = "";
    		containingElement.style.paddingTop = "";
    		containingElement.style.paddingBottom = "";
    		containingElement.style.paddingLeft = "";
    		containingElement.style.paddingRight = "";
    		containingElement.children[0].style.display = cachedDisplay;

    		if (!!currentlyDraggingOver && currentlyDraggingOver.item.id === $dragTarget.item.id) {
    			$$invalidate(5, currentlyDraggingOver = undefined);
    			$$subscribe_hoverEnterElementTween($$invalidate(8, hoverEnterElementTween = undefined));
    		}

    		$dropTargets.filter(target => target.key === hierarchyKey).forEach(target => target.cleanupDropZone());
    		set_store_value(dragTarget, $dragTarget = undefined);
    	};

    	const cleanupDropZone = () => {
    		if (!!currentlyDraggingOver) {
    			startDragOff();
    		}

    		$$invalidate(34, cachedRects = []);
    		draggableDragStart = undefined;
    		cachedDisplay = undefined;
    		$$invalidate(44, currentDropTarget = undefined);
    		$$subscribe_dragScrollTween($$invalidate(10, dragScrollTween = undefined));
    		active = false;
    	};

    	const endDrag = event => __awaiter(void 0, void 0, void 0, function* () {
    		if (($dragTarget === null || $dragTarget === void 0
    		? void 0
    		: $dragTarget.controllingDropZoneId) === id && ($dragging === "picking-up" || $dragging === "dragging")) {
    			event.preventDefault();

    			if (!!currentDropTarget) {
    				// Ensure we have the latest hoverResult, but don't update it to `undefined` if it was defined.
    				let hoverResult = currentDropTarget.dropTarget.hoverCallback() || currentDropTarget.hoverResult;

    				set_store_value(dragging, $dragging = "dropping");
    				let offset;

    				// go go gadget structural typing
    				if (!!hoverResult) {
    					const boundingRect = hoverResult.element.getBoundingClientRect();

    					if (hoverResult.placement === "before") {
    						offset = boundingRect;
    					} else {
    						const strippedRect = removePaddingFromRect(hoverResult.element, boundingRect);

    						if (direction === "horizontal") {
    							offset = {
    								x: boundingRect.x + strippedRect.width,
    								y: boundingRect.y
    							};
    						} else {
    							offset = {
    								x: boundingRect.x,
    								y: boundingRect.y + strippedRect.height
    							};
    						}
    					}
    				} else {
    					offset = currentDropTarget.dropTarget.rect;
    				}

    				const position = {
    					x: offset.x - $dragTarget.sourceRect.x,
    					y: offset.y - $dragTarget.sourceRect.y
    				};

    				// Tweened .set returns a promise that resolves, but our types don't show that
    				yield dragTween.set(position);

    				currentDropTarget.dropTarget.dropCallback(hoverResult);

    				// We only send drop events when reordering a list, since the element never really left
    				if (currentDropTarget.dropTarget.id !== id) {
    					const dragOutResult = {
    						item: $dragTarget.item,
    						listSnapshot: [
    							...$cache.items.filter(cachedItem => cachedItem.id !== $dragTarget.item.id)
    						],
    						destinationDropZone: currentDropTarget.dropTarget.id
    					};

    					if (!!dropGroup && dropGroup.key === hierarchyKey) {
    						dropGroup.onDragOut(dragOutResult.item, dragOutResult.listSnapshot, id);
    					}

    					dispatch("itemdraggedout", dragOutResult);
    				}

    				cleanupAfterDrag();
    			} else {
    				set_store_value(dragging, $dragging = "returning");
    				sourceElementTween.set($dragTarget.sourceRect[$cache.dimensionKey]);

    				if (!!currentlyDraggingOver) {
    					startDragOff();
    				}

    				// Tweened .set returns a promise that resolves, but our types don't show that
    				yield dragTween.set({ x: 0, y: 0 });

    				if (!!dropGroup && dropGroup.key === hierarchyKey) {
    					dropGroup.onDragCancel($dragTarget.item);
    				}

    				dispatch("dragcancelled", { item: $dragTarget.item });
    				cleanupAfterDrag();
    			}
    		}
    	});

    	const handleDraggableMouseDown = (event, id, delayedEvent) => {
    		if (!disabled && !!$cache.items.find(c => c.id === id) && event.button === 0) {
    			draggableDragStart = { x: event.clientX, y: event.clientY };
    			potentiallDraggedId = id;

    			if (!!delayedEvent) {
    				handleDelayedEvent = () => {
    					delayedEvent(event);
    				};
    			}
    		} else if (!!delayedEvent) {
    			delayedEvent(event);
    		}
    	};

    	const handleDraggableMouseUp = () => {
    		if ($dragging === "none") {
    			if (handleDelayedEvent) {
    				handleDelayedEvent();
    			}

    			draggableDragStart = undefined;
    			potentiallDraggedId = undefined;
    			handleDelayedEvent = undefined;
    		}
    	};

    	const handleDraggableMouseMove = event => __awaiter(void 0, void 0, void 0, function* () {
    		if (!!draggableDragStart && $dragging === "none") {
    			let dx = draggableDragStart.x - event.clientX;
    			let dy = draggableDragStart.y - event.clientY;

    			if (dx * dx + dy * dy > $dragDropSettings.dragThresholdPixels) {
    				set_store_value(dragging, $dragging = "picking-up");
    				const containingElement = wrappingElements[potentiallDraggedId];
    				const cloned = makeDraggableElement(containingElement, potentiallDraggedId);
    				document.body.append(cloned);

    				set_store_value(dragTarget, $dragTarget = {
    					item: $cache.items.find(c => c.id === potentiallDraggedId),
    					key: hierarchyKey,
    					controllingDropZoneId: id,
    					dragElement: cloned,
    					sourceRect: containingElement.getBoundingClientRect(),
    					cachedRect: cloned.getBoundingClientRect()
    				});

    				$$subscribe_dragTween($$invalidate(6, dragTween = tweened({ x: 0, y: 0 }, {
    					duration: $dragDropSettings.animationMs,
    					easing: cubicOut
    				})));

    				$$subscribe_sourceElementTween($$invalidate(7, sourceElementTween = tweened($dragTarget.sourceRect[$cache.dimensionKey], {
    					duration: $dragDropSettings.animationMs,
    					easing: cubicOut
    				})));

    				updateContainingStyleSize(containingElement, $cache.direction, $dragTarget.sourceRect[$cache.dimensionKey]);
    				const child = containingElement.children[0];
    				cachedDisplay = child.style.display;
    				child.style.display = "none";
    				active = true;
    				$dropTargets.filter(target => target.key === hierarchyKey).forEach(target => target.prepareDropZone());

    				if (!!dropGroup && dropGroup.key === hierarchyKey) {
    					dropGroup.onDragStart();
    				}

    				// Tweened .set returns a promise that resolves, but our types don't show that
    				yield sourceElementTween.set(0);

    				set_store_value(dragging, $dragging = "dragging");
    				$$invalidate(34, cachedRects = []);
    			}
    		}
    	});

    	const prepareDropZone = () => {
    		dragScrollCurrent = dropZone[$cache.scrollKey];
    		dragScrollTarget = dragScrollCurrent;
    		potentiallDraggedId = undefined;
    		handleDelayedEvent = undefined;
    		$$invalidate(5, currentlyDraggingOver = undefined);
    		$$invalidate(44, currentDropTarget = undefined);
    		$$invalidate(39, previouslyDraggedOver = []);
    	};

    	const dropCallback = drop => {
    		let dropIndex;

    		if (!!drop) {
    			if (drop.placement === "before") {
    				dropIndex = drop.index;
    			} else {
    				dropIndex = drop.index + 1;
    			}
    		} else {
    			dropIndex = 0;
    		}

    		// Always filter because it isn't that expensive and it avoids special casing dropping back in the same list (as much as possible)
    		const firstSection = $cache.items.slice(0, dropIndex).filter(cachedItem => cachedItem.id !== $dragTarget.item.id);

    		const secondSection = $cache.items.slice(dropIndex).filter(cachedItem => cachedItem.id !== $dragTarget.item.id);
    		const listSnapshot = [...firstSection, $dragTarget.item, ...secondSection];
    		const finalIndex = listSnapshot.findIndex(snapshotItem => snapshotItem.id === $dragTarget.item.id);

    		if (!!currentlyDraggingOver) {
    			removePaddingFromHoverResult(currentlyDraggingOver);
    			$$invalidate(5, currentlyDraggingOver = undefined);
    			$$subscribe_hoverEnterElementTween($$invalidate(8, hoverEnterElementTween = undefined));
    		}

    		const dropInResult = {
    			item: $dragTarget.item,
    			index: finalIndex,
    			insertedAfter: finalIndex > 0
    			? $cache.items[finalIndex - 1]
    			: undefined,
    			listSnapshot,
    			sourceDropZone: $dragTarget.controllingDropZoneId
    		};

    		if (!!dropGroup && dropGroup.key === hierarchyKey) {
    			dropGroup.onDropIn(dropInResult.item, dropInResult.index, dropInResult.insertedAfter, dropInResult.listSnapshot, dropInResult.sourceDropZone, id);
    		}

    		dispatch("itemdroppedin", dropInResult);
    	};

    	const startDragOver = hoverResult => {
    		if (disableDropSpacing) {
    			return;
    		}

    		const draggedOffIndex = previouslyDraggedOver.findIndex(previous => previous.item.id === hoverResult.item.id && previous.placement === hoverResult.placement);
    		let startingSize = 0;

    		if (draggedOffIndex > -1) {
    			$$invalidate(39, previouslyDraggedOver = previouslyDraggedOver.filter((_, index) => index !== draggedOffIndex));
    			const sizes = $hoverLeaveElementTweens;
    			startingSize = Math.min(sizes[draggedOffIndex], $dragTarget.cachedRect[$cache.dimensionKey]);
    			const filteredSizes = sizes.filter((_, index) => index !== draggedOffIndex);

    			$$subscribe_hoverLeaveElementTweens($$invalidate(9, hoverLeaveElementTweens = tweened(filteredSizes, {
    				duration: $dragDropSettings.animationMs,
    				easing: cubicOut
    			})));

    			hoverLeaveElementTweens.set(new Array(filteredSizes.length).fill(0));
    		}

    		$$invalidate(5, currentlyDraggingOver = hoverResult);

    		$$subscribe_hoverEnterElementTween($$invalidate(8, hoverEnterElementTween = tweened(startingSize, {
    			duration: $dragDropSettings.animationMs,
    			easing: cubicOut
    		})));

    		hoverEnterElementTween.set($dragTarget.cachedRect[$cache.dimensionKey]);
    	};

    	const startDragOff = () => {
    		if (!currentlyDraggingOver) {
    			return;
    		}

    		const indexOfCurrent = previouslyDraggedOver.findIndex(prev => prev.item.id === currentlyDraggingOver.item.id && prev.placement === currentlyDraggingOver.placement);

    		let previousTweenValues = !!hoverLeaveElementTweens
    		? $hoverLeaveElementTweens
    		: [];

    		if (indexOfCurrent >= 0) {
    			$$invalidate(39, previouslyDraggedOver = previouslyDraggedOver.filter((_, index) => index !== indexOfCurrent));
    			previousTweenValues = previousTweenValues.filter((_, index) => index !== indexOfCurrent);
    		}

    		$$invalidate(39, previouslyDraggedOver = [...previouslyDraggedOver, currentlyDraggingOver]);

    		$$subscribe_hoverLeaveElementTweens($$invalidate(9, hoverLeaveElementTweens = tweened(
    			[
    				...previousTweenValues,
    				Math.min($hoverEnterElementTween, $dragTarget.cachedRect[$cache.dimensionKey])
    			],
    			{
    				duration: $dragDropSettings.animationMs,
    				easing: cubicOut
    			}
    		)));

    		hoverLeaveElementTweens.set(new Array(previousTweenValues.length + 1).fill(0));
    		$$subscribe_hoverEnterElementTween($$invalidate(8, hoverEnterElementTween = undefined));
    		$$invalidate(5, currentlyDraggingOver = undefined);
    	};

    	const checkScroll = () => {
    		if (disableScrollOnDrag) {
    			$$subscribe_dragScrollTween($$invalidate(10, dragScrollTween = undefined));
    			dragScrollTarget = dragScrollCurrent;
    			return;
    		}

    		const midpoint = $cache.direction === "horizontal"
    		? computeMidpoint($dragTarget.cachedRect).x
    		: computeMidpoint($dragTarget.cachedRect).y;

    		const compOffset = $cache.direction === "horizontal"
    		? cachedDropZoneRect.x
    		: cachedDropZoneRect.y;

    		let threshold = Math.min(Math.max($dragDropSettings.scrollOnDragThresholdPercent * cachedDropZoneRect[$cache.dimensionKey], $dragDropSettings.scrollOnDragMinPixels), $dragDropSettings.scrollOnDragMaxPixels);

    		if (midpoint <= threshold + compOffset) {
    			const ratio = 1 - (midpoint - compOffset) / threshold;

    			if (dragScrollTarget >= dragScrollCurrent) {
    				$$subscribe_dragScrollTween($$invalidate(10, dragScrollTween = tweened(dragScrollCurrent, { duration: $dragDropSettings.animationMs })));

    				/* Use truncation rather than floor because it is more consistent
               Math.trunc(1.1) === 1, Math.trunc(-1.1) === -1 */
    				dragScrollTarget = Math.trunc(dragScrollCurrent - lerp(ratio, $dragDropSettings.minDragScrollSpeed, $dragDropSettings.maxDragScrollSpeed));

    				dragScrollTween.set(dragScrollTarget);
    			}
    		} else if (midpoint >= cachedDropZoneRect[$cache.dimensionKey] - threshold + compOffset) {
    			const ratio = (midpoint - (cachedDropZoneRect[$cache.dimensionKey] - threshold + compOffset)) / threshold;

    			if (dragScrollTarget <= dragScrollCurrent) {
    				$$subscribe_dragScrollTween($$invalidate(10, dragScrollTween = tweened(dragScrollCurrent, { duration: $dragDropSettings.animationMs })));
    				dragScrollTarget = Math.trunc(dragScrollCurrent + lerp(ratio, $dragDropSettings.minDragScrollSpeed, $dragDropSettings.maxDragScrollSpeed));
    				dragScrollTween.set(dragScrollTarget);
    			}
    		} else {
    			$$subscribe_dragScrollTween($$invalidate(10, dragScrollTween = undefined));
    			dragScrollTarget = dragScrollCurrent;
    		}
    	};

    	const hoverCallback = () => {
    		if ($cache.items.length === 0) {
    			return undefined;
    		}

    		checkScroll();
    		let overlapped = false;
    		const overlapping = [];

    		for (let index = 0; index < $cache.items.length; index++) {
    			const cachedItem = $cache.items[index];
    			const element = wrappingElements[cachedItem.id];

    			if (index >= cachedRects.length || cachedRects[index] === undefined) {
    				$$invalidate(34, cachedRects[index] = element.getBoundingClientRect(), cachedRects);
    			}

    			let overlaps = overlap($dragTarget.cachedRect, cachedRects[index]);
    			let rectWithoutPadding = removePaddingFromRect(element, cachedRects[index]);
    			let placement = calculatePlacement(rectWithoutPadding, $dragTarget.cachedRect, $cache.direction);

    			if (overlaps) {
    				overlapping.push({
    					index,
    					item: cachedItem,
    					element,
    					placement
    				});

    				overlapped = true;
    			} else if (overlapped) {
    				break;
    			}
    		}

    		// Since cachedItems must be non-empty. If nothing overlaps, we are past the end of the list.
    		if (overlapping.length === 0) {
    			const lastIndex = $cache.items.length - 1;
    			const lastItem = $cache.items[lastIndex];

    			overlapping.push({
    				index: lastIndex,
    				item: lastItem,
    				element: wrappingElements[lastItem.id],
    				placement: "after"
    			});
    		}

    		const midpoint = Math.trunc((overlapping[0].index + overlapping[overlapping.length - 1].index) / 2);
    		let overlappedItem = overlapping.find(o => o.index === midpoint);

    		/* Only use 'before' placement at the start of the list. Since we are changing padding,
     we want to reduce the chance of weird interactions with wrapping.
     */
    		if (overlappedItem.placement === "before" && overlappedItem.index > 0) {
    			const indexBefore = overlappedItem.index - 1;
    			const itemBefore = $cache.items[indexBefore];

    			overlappedItem = {
    				index: indexBefore,
    				item: itemBefore,
    				element: wrappingElements[itemBefore.id],
    				placement: "after"
    			};
    		}

    		if (!currentlyDraggingOver) {
    			startDragOver(overlappedItem);
    		} else if (currentlyDraggingOver.item.id !== overlappedItem.item.id || currentlyDraggingOver.placement !== overlappedItem.placement) {
    			startDragOff();
    			startDragOver(overlappedItem);
    		}

    		return overlappedItem;
    	};

    	const enterDropZone = () => {
    		active = true;

    		dispatch("dropzoneenter", {
    			item: $dragTarget.item,
    			rect: $dragTarget.cachedRect
    		});
    	};

    	const leaveDropZone = () => {
    		active = false;

    		if (!!currentlyDraggingOver) {
    			startDragOff();
    		}

    		dragScrollTarget = dragScrollCurrent;
    		$$subscribe_dragScrollTween($$invalidate(10, dragScrollTween = undefined));

    		dispatch("dropzoneleave", {
    			item: $dragTarget.item,
    			rect: $dragTarget.cachedRect
    		});
    	};

    	const hasItem = itemId => {
    		return !!$cache.items.find(c => c.id === itemId);
    	};

    	const getEventHandlers = () => {
    		return {
    			handleMouseDown: handleDraggableMouseDown,
    			handleMouseUp: handleDraggableMouseUp,
    			handleMouseMove: handleDraggableMouseMove
    		};
    	};

    	const canDrop = () => {
    		return !disabled && $dragTarget.key === hierarchyKey && capacity - $cache.items.length > 0 && allowDrop($dragTarget.item, $dragTarget.controllingDropZoneId);
    	};

    	const postScrollUpdate = () => __awaiter(void 0, void 0, void 0, function* () {
    		const previous = dragScrollCurrent;
    		yield tick();
    		dragScrollCurrent = dropZone[$cache.scrollKey];
    		const delta = dragScrollCurrent - previous;

    		if (delta !== 0) {
    			const offsetPosition = $cache.direction === "horizontal"
    			? { x: -delta, y: 0 }
    			: { x: 0, y: -delta };

    			$$invalidate(34, cachedRects = translateRectsBy(cachedRects, 0, offsetPosition));
    		}

    		if (dragScrollCurrent === dragScrollTarget) {
    			checkScroll();
    		}

    		if (active) {
    			// TODO: I think this is part of the padding bug, but we need to run the
    			hoverCallback();
    		}
    	});

    	onMount(() => {
    		$$invalidate(37, mounted = true);
    	});

    	onDestroy(() => {
    		set_store_value(dropTargets, $dropTargets = $dropTargets.filter(dt => dt.id !== id));
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value, item) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrappingElements[item.id] = $$value;
    			$$invalidate(1, wrappingElements);
    		});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			dropZone = $$value;
    			(((($$invalidate(2, dropZone), $$invalidate(49, $dragging)), $$invalidate(10, dragScrollTween)), $$invalidate(11, $cache)), $$invalidate(55, $dragScrollTween));
    		});
    	}

    	function div_elementresize_handler() {
    		currentWidth = this.clientWidth;
    		currentHeight = this.clientHeight;
    		$$invalidate(3, currentWidth);
    		$$invalidate(4, currentHeight);
    	}

    	function div_binding_2($$value, item) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrappingElements[item.id] = $$value;
    			$$invalidate(1, wrappingElements);
    		});
    	}

    	function div_binding_3($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			dropZone = $$value;
    			(((($$invalidate(2, dropZone), $$invalidate(49, $dragging)), $$invalidate(10, dragScrollTween)), $$invalidate(11, $cache)), $$invalidate(55, $dragScrollTween));
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(18, items = $$props.items);
    		if ("key" in $$props) $$invalidate(19, key = $$props.key);
    		if ("capacity" in $$props) $$invalidate(20, capacity = $$props.capacity);
    		if ("disabled" in $$props) $$invalidate(21, disabled = $$props.disabled);
    		if ("disableScrollOnDrag" in $$props) $$invalidate(22, disableScrollOnDrag = $$props.disableScrollOnDrag);
    		if ("disableDropSpacing" in $$props) $$invalidate(23, disableDropSpacing = $$props.disableDropSpacing);
    		if ("enableResizeListeners" in $$props) $$invalidate(0, enableResizeListeners = $$props.enableResizeListeners);
    		if ("direction" in $$props) $$invalidate(24, direction = $$props.direction);
    		if ("allowDrop" in $$props) $$invalidate(25, allowDrop = $$props.allowDrop);
    		if ("$$scope" in $$props) $$invalidate(27, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*key*/ 524288) {
    			 {
    				$$invalidate(45, hierarchyKey = key !== null && key !== void 0
    				? key
    				: dropGroup === null || dropGroup === void 0
    					? void 0
    					: dropGroup.key);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*dragScrollTween, $cache*/ 3072 | $$self.$$.dirty[1] & /*$dragging, $dragScrollTween*/ 17039360) {
    			// Update scroll
    			 {
    				if ($dragging === "dragging" && !!dragScrollTween) {
    					$$invalidate(2, dropZone[$cache.scrollKey] = $dragScrollTween, dropZone);
    					postScrollUpdate();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*enableResizeListeners, currentWidth, currentHeight, dropZone*/ 29 | $$self.$$.dirty[1] & /*mounted, cachedDropZoneRect, $dropTargets, hierarchyKey*/ 1065040) {
    			// Update the dropTarget for this dropZone
    			 {
    				if (mounted) {
    					let updatedRect = false;
    					let updatedCapacity = false;
    					let updatedDisabled = false;

    					if (enableResizeListeners && ((cachedDropZoneRect === null || cachedDropZoneRect === void 0
    					? void 0
    					: cachedDropZoneRect.width) !== currentWidth || (cachedDropZoneRect === null || cachedDropZoneRect === void 0
    					? void 0
    					: cachedDropZoneRect.height) !== currentHeight)) {
    						let bounding = dropZone.getBoundingClientRect();

    						$$invalidate(35, cachedDropZoneRect = {
    							x: bounding.left,
    							y: bounding.top,
    							width: currentWidth,
    							height: currentHeight
    						});

    						updatedRect = true;
    					}

    					if (updatedRect || updatedCapacity || updatedDisabled) {
    						set_store_value(dropTargets, $dropTargets = [
    							...$dropTargets.filter(dt => dt.id !== id),
    							{
    								id,
    								key: hierarchyKey,
    								rect: cachedDropZoneRect,
    								dropElement: dropZone,
    								dropCallback,
    								hoverCallback,
    								prepareDropZone,
    								enterDropZone,
    								leaveDropZone,
    								hasItem,
    								getEventHandlers,
    								cleanupDropZone,
    								canDrop
    							}
    						]);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*items, direction*/ 17039360 | $$self.$$.dirty[1] & /*$dragging, hierarchyKey, $dragTarget*/ 409600) {
    			// Update list of items
    			 {
    				if ($dragging === "none" || hierarchyKey !== $dragTarget.key) {
    					cache.set({ items, direction });
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*wrappingElements, $cache*/ 2050 | $$self.$$.dirty[1] & /*$dragTarget, $dragging, $sourceElementTween*/ 8781824) {
    			// Hide element that was dragged
    			 {
    				if (($dragTarget === null || $dragTarget === void 0
    				? void 0
    				: $dragTarget.controllingDropZoneId) === id && ($dragging === "picking-up" || $dragging === "returning")) {
    					updateContainingStyleSize(wrappingElements[$dragTarget.item.id], $cache.direction, $sourceElementTween);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*currentlyDraggingOver, hoverEnterElementTween, $cache*/ 2336 | $$self.$$.dirty[1] & /*$hoverEnterElementTween, cachedRects*/ 4194312) {
    			// Drop preview transition in
    			 {
    				if (!!currentlyDraggingOver && !!hoverEnterElementTween) {
    					const offset = $hoverEnterElementTween;
    					const lastOffset = pixelStringToNumber(currentlyDraggingOver.element.style[$cache.paddingKeys[currentlyDraggingOver.placement]]);
    					$$invalidate(5, currentlyDraggingOver.element.style[$cache.paddingKeys[currentlyDraggingOver.placement]] = `${offset}px`, currentlyDraggingOver);
    					const delta = offset - lastOffset;

    					const offsetPosition = $cache.direction === "horizontal"
    					? { x: delta, y: 0 }
    					: { x: 0, y: delta };

    					if (cachedRects.length >= currentlyDraggingOver.index) {
    						$$invalidate(34, cachedRects = growOrShrinkRectInList(cachedRects, currentlyDraggingOver.index, offsetPosition));
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*hoverLeaveElementTweens, $cache*/ 2560 | $$self.$$.dirty[1] & /*previouslyDraggedOver, $hoverLeaveElementTweens, $dragDropSettings, cachedRects*/ 2162952) {
    			// Drop preview transition out
    			 {
    				if (previouslyDraggedOver.length > 0 && !!hoverLeaveElementTweens) {
    					const sizes = $hoverLeaveElementTweens;
    					const deltas = [];

    					const previousSizes = previouslyDraggedOver.map(target => {
    						return pixelStringToNumber(target.element.style[$cache.paddingKeys[target.placement]]);
    					});

    					$$invalidate(39, previouslyDraggedOver = previouslyDraggedOver.map((target, index) => {
    						const delta = sizes[index] - previousSizes[index];
    						deltas.push({ index: target.index, delta });
    						target.element.style[$cache.paddingKeys[target.placement]] = `${sizes[index]}px`;
    						return target;
    					}));

    					let zeros = 0;

    					for (let i = 0; i < sizes.length; i++) {
    						if (sizes[i] > 0) {
    							break;
    						}

    						++zeros;
    					}

    					if (zeros > 0) {
    						$$invalidate(39, previouslyDraggedOver = previouslyDraggedOver.slice(zeros));

    						$$subscribe_hoverLeaveElementTweens($$invalidate(9, hoverLeaveElementTweens = tweened(sizes.slice(zeros), {
    							duration: $dragDropSettings.animationMs,
    							easing: cubicOut
    						})));

    						hoverLeaveElementTweens.set(new Array(previouslyDraggedOver.length).fill(0));
    					}

    					deltas.forEach(({ index, delta }) => {
    						if (cachedRects.length >= index) {
    							const offsetPosition = $cache.direction === "horizontal"
    							? { x: delta, y: 0 }
    							: { x: 0, y: delta };

    							$$invalidate(34, cachedRects = growOrShrinkRectInList(cachedRects, index, offsetPosition));
    						}
    					});
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*$dragTarget, $dragging, $dragTween, $dropTargets, currentDropTarget*/ 1974272) {
    			// Move dragTarget
    			 {
    				if (($dragTarget === null || $dragTarget === void 0
    				? void 0
    				: $dragTarget.controllingDropZoneId) === id) {
    					// I like guards
    					if ($dragging !== "none") {
    						dragTarget.update(target => {
    							const dragOffset = $dragTween;
    							target.dragElement.style.transform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`;

    							target.cachedRect = moveRectTo(target.cachedRect, {
    								x: dragOffset.x + target.sourceRect.x,
    								y: dragOffset.y + target.sourceRect.y
    							});

    							return target;
    						});
    					}

    					if ($dragging === "dragging") {
    						const overlapping = $dropTargets.map(target => {
    							return {
    								target,
    								overlap: percentOverlap($dragTarget.cachedRect, target.rect)
    							};
    						}).reduce((acc, next) => {
    							if (next.overlap.overlapX > acc.overlap.overlapX || next.overlap.overlapY > acc.overlap.overlapY) {
    								return next;
    							}

    							return acc;
    						});

    						const hasDropTarget = overlapping.overlap.overlapX > 0 && overlapping.overlap.overlapY > 0;
    						const valid = hasDropTarget && overlapping.target.canDrop();

    						if (valid) {
    							if (!!currentDropTarget && currentDropTarget.dropTarget.id !== overlapping.target.id) {
    								currentDropTarget.dropTarget.leaveDropZone();
    								$$invalidate(44, currentDropTarget = undefined);
    							}

    							if (!currentDropTarget) {
    								overlapping.target.enterDropZone();
    							}

    							const hoverResult = overlapping.target.hoverCallback();

    							$$invalidate(44, currentDropTarget = {
    								dropTarget: overlapping.target,
    								hoverResult
    							});
    						} else if (!!currentDropTarget) {
    							currentDropTarget.dropTarget.leaveDropZone();
    							$$invalidate(44, currentDropTarget = undefined);
    						}
    					}
    				}
    			}
    		}
    	};

    	return [
    		enableResizeListeners,
    		wrappingElements,
    		dropZone,
    		currentWidth,
    		currentHeight,
    		currentlyDraggingOver,
    		dragTween,
    		sourceElementTween,
    		hoverEnterElementTween,
    		hoverLeaveElementTweens,
    		dragScrollTween,
    		$cache,
    		cache,
    		moveDraggable,
    		endDrag,
    		handleDraggableMouseDown,
    		handleDraggableMouseUp,
    		handleDraggableMouseMove,
    		items,
    		key,
    		capacity,
    		disabled,
    		disableScrollOnDrag,
    		disableDropSpacing,
    		direction,
    		allowDrop,
    		id,
    		$$scope,
    		$$slots,
    		div_binding,
    		div_binding_1,
    		div_elementresize_handler,
    		div_binding_2,
    		div_binding_3
    	];
    }

    class DropList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				items: 18,
    				key: 19,
    				capacity: 20,
    				disabled: 21,
    				disableScrollOnDrag: 22,
    				disableDropSpacing: 23,
    				enableResizeListeners: 0,
    				direction: 24,
    				allowDrop: 25,
    				id: 26
    			},
    			[-1, -1, -1]
    		);
    	}

    	get id() {
    		return this.$$.ctx[26];
    	}
    }

    exports.DragHandle = DragHandle;
    exports.DropGroup = DropGroup;
    exports.DropList = DropList;
    exports.dragDropSettings = dragDropSettings;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

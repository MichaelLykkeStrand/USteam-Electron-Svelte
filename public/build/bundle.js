
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var IDX=256, HEX=[], BUFFER;
    while (IDX--) HEX[IDX] = (IDX + 256).toString(16).substring(1);

    function v4() {
    	var i=0, num, out='';

    	if (!BUFFER || ((IDX + 16) > 256)) {
    		BUFFER = Array(i=256);
    		while (i--) BUFFER[i] = 256 * Math.random() | 0;
    		i = IDX = 0;
    	}

    	for (; i < 16; i++) {
    		num = BUFFER[IDX + i];
    		if (i==6) out += HEX[num & 15 | 64];
    		else if (i==8) out += HEX[num & 63 | 128];
    		else out += HEX[num];

    		if (i & 1 && i > 1 && i < 11) out += '-';
    	}

    	IDX++;
    	return out;
    }

    /** Dispatch event on click outside of node */
    function clickOutside(node) {
      
        const handleClick = event => {
          if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
              new CustomEvent('click_outside', node)
            );
          }
        };
      
          document.addEventListener('click', handleClick, true);
        
        return {
          destroy() {
            document.removeEventListener('click', handleClick, true);
          }
          }
      }

    /* src\components\shared\colorPicker.svelte generated by Svelte v3.19.1 */
    const file = "src\\components\\shared\\colorPicker.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (171:1) {#if ddActive}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let div1_resize_listener;
    	let clickOutside_action;
    	let dispose;
    	let each_value = /*values*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "values-dropdown-grid svelte-1drydlv");
    			add_location(div0, file, 178, 3, 3703);
    			attr_dev(div1, "class", "values-dropdown svelte-1drydlv");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[19].call(div1));
    			toggle_class(div1, "top", /*top*/ ctx[3]);
    			add_location(div1, file, 171, 2, 3549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[19].bind(div1));

    			dispose = [
    				action_destroyer(clickOutside_action = clickOutside.call(null, div1)),
    				listen_dev(div1, "click_outside", /*clickOutsideDropdown*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values, id, value, keyboardGridNav, changeValue*/ 6275) {
    				each_value = /*values*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*top*/ 8) {
    				toggle_class(div1, "top", /*top*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			div1_resize_listener.cancel();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(171:1) {#if ddActive}",
    		ctx
    	});

    	return block;
    }

    // (181:5) {#each val as innerValue, innerIndex}
    function create_each_block_1(ctx) {
    	let button;
    	let button_id_value;
    	let dispose;

    	function keydown_handler(...args) {
    		return /*keydown_handler*/ ctx[17](/*innerIndex*/ ctx[25], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[18](/*innerValue*/ ctx[23], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "id", button_id_value = "" + (/*id*/ ctx[1] + "-" + /*index*/ ctx[22] + "-" + /*innerIndex*/ ctx[25]));
    			set_style(button, "background", /*innerValue*/ ctx[23]);
    			attr_dev(button, "class", "color-block svelte-1drydlv");
    			toggle_class(button, "active", /*innerValue*/ ctx[23] == /*value*/ ctx[0]);
    			add_location(button, file, 181, 6, 3823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			dispose = [
    				listen_dev(button, "keydown", keydown_handler, false, false, false),
    				listen_dev(button, "click", click_handler_1, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*id*/ 2 && button_id_value !== (button_id_value = "" + (/*id*/ ctx[1] + "-" + /*index*/ ctx[22] + "-" + /*innerIndex*/ ctx[25]))) {
    				attr_dev(button, "id", button_id_value);
    			}

    			if (dirty & /*values, value*/ 129) {
    				toggle_class(button, "active", /*innerValue*/ ctx[23] == /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(181:5) {#each val as innerValue, innerIndex}",
    		ctx
    	});

    	return block;
    }

    // (180:4) {#each values as val, index}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*val*/ ctx[20];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id, values, value, keyboardGridNav, changeValue*/ 6275) {
    				each_value_1 = /*val*/ ctx[20];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(180:4) {#each values as val, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div3;
    	let button;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let button_resize_listener;
    	let t1;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[14]);
    	let if_block = /*ddActive*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			button = element("button");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			if (if_block) if_block.c();
    			set_style(div0, "background", /*value*/ ctx[0]);
    			attr_dev(div0, "class", "color-block svelte-1drydlv");
    			add_location(div0, file, 164, 4, 3371);
    			attr_dev(div1, "class", "caret svelte-1drydlv");
    			set_style(div1, "margin-right", ".2rem");
    			toggle_class(div1, "top", /*top*/ ctx[3]);
    			add_location(div1, file, 165, 4, 3433);
    			set_style(div2, "display", "flex");
    			add_location(div2, file, 163, 3, 3337);
    			attr_dev(button, "class", "select-color svelte-1drydlv");
    			add_render_callback(() => /*button_elementresize_handler*/ ctx[15].call(button));
    			toggle_class(button, "fake-focus", /*ddActive*/ ctx[4]);
    			add_location(button, file, 157, 2, 3187);
    			attr_dev(div3, "class", "color-picker-inner svelte-1drydlv");
    			add_location(div3, file, 156, 1, 3151);
    			attr_dev(div4, "class", "color-picker-holder svelte-1drydlv");
    			add_location(div4, file, 155, 0, 3115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			button_resize_listener = add_resize_listener(button, /*button_elementresize_handler*/ ctx[15].bind(button));
    			append_dev(div4, t1);
    			if (if_block) if_block.m(div4, null);

    			dispose = [
    				listen_dev(window, "keydown", /*handleKeydown*/ ctx[8], false, false, false),
    				listen_dev(window, "resize", /*onwindowresize*/ ctx[14]),
    				listen_dev(button, "click", /*click_handler*/ ctx[16], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) {
    				set_style(div0, "background", /*value*/ ctx[0]);
    			}

    			if (dirty & /*top*/ 8) {
    				toggle_class(div1, "top", /*top*/ ctx[3]);
    			}

    			if (dirty & /*ddActive*/ 16) {
    				toggle_class(button, "fake-focus", /*ddActive*/ ctx[4]);
    			}

    			if (/*ddActive*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			button_resize_listener.cancel();
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { id = v4() } = $$props;
    	let { value = "#5E7ABC" } = $$props;

    	// Our color set
    	let values = [
    		["#DAAFE9", "#C7DBF5", "#AAD5FB", "#ADE5DA", "#B0EDC3", "#FDF0A4", "#F8D6A2"],
    		["#C47ADA", "#90BAEE", "#75BAFA", "#72D5BF", "#73DE8C", "#FBE66E", "#F5B969"],
    		["#AE44B7", "#5E7ABC", "#5E7ABC", "#4DACA9", "#63B75A", "#EDBD4A", "#EC9740"],
    		["#501B87", "#021B6B", "#0C2794", "#337277", "#2F6A52", "#AE802F", "#AD6127"]
    	];

    	// Keyboard shortcut
    	let trigger = "Escape";

    	function handleKeydown(e) {
    		if (e.key == trigger) {
    			$$invalidate(4, ddActive = false);
    		}
    	}

    	let windowHeight;
    	let top;
    	let ddActive = false;
    	let ddHeight = 158;

    	// ddHeight is initially undefined so we can't get the correct values from binding; that's why we have a default
    	// todo render offscreen for .1sec to get the height automatically?
    	let inputHeight;

    	async function toggleDropdown(e) {
    		if (e.clientY + inputHeight < ddHeight || windowHeight - ddHeight - inputHeight - e.clientY > 0) {
    			$$invalidate(3, top = false);
    		} else {
    			$$invalidate(3, top = true);
    		}

    		$$invalidate(4, ddActive = !ddActive);
    		await tick();
    	}

    	function clickOutsideDropdown() {
    		$$invalidate(4, ddActive = false);
    	}

    	function changeValue(innerValue) {
    		$$invalidate(0, value = innerValue);
    		$$invalidate(4, ddActive = false);
    	}

    	function keyboardGridNav(e, index) {
    		const focussedElement = document.activeElement.id;
    		let myRow = parseInt(focussedElement.charAt(focussedElement.length - 3));
    		let myIndex = parseInt(focussedElement.charAt(focussedElement.length - 1));
    		let nextRow;
    		let prevRow;
    		let nextIndex;
    		let prevIndex;

    		switch (e.keyCode) {
    			case 37:
    				prevIndex = myIndex - 1;
    				if (prevIndex > -1) {
    					document.getElementById(id + "-" + myRow + "-" + prevIndex).focus();
    				}
    				break;
    			case 38:
    				prevRow = myRow - 1;
    				if (prevRow > -1) {
    					document.getElementById(id + "-" + prevRow + "-" + myIndex).focus();
    				}
    				break;
    			case 39:
    				nextIndex = myIndex + 1;
    				if (nextIndex < values[0].length) {
    					document.getElementById(id + "-" + myRow + "-" + nextIndex).focus();
    				}
    				break;
    			case 40:
    				nextRow = myRow + 1;
    				if (nextRow < values.length) {
    					document.getElementById(id + "-" + nextRow + "-" + myIndex).focus();
    				}
    				break;
    		}
    	}

    	const writable_props = ["id", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(2, windowHeight = window.innerHeight);
    	}

    	function button_elementresize_handler() {
    		inputHeight = this.clientHeight;
    		$$invalidate(6, inputHeight);
    	}

    	const click_handler = e => toggleDropdown(e);
    	const keydown_handler = (innerIndex, e) => keyboardGridNav(e);

    	const click_handler_1 = innerValue => {
    		changeValue(innerValue);
    	};

    	function div1_elementresize_handler() {
    		ddHeight = this.clientHeight;
    		$$invalidate(5, ddHeight);
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		uuid: v4,
    		clickOutside,
    		tick,
    		id,
    		value,
    		values,
    		trigger,
    		handleKeydown,
    		windowHeight,
    		top,
    		ddActive,
    		ddHeight,
    		inputHeight,
    		toggleDropdown,
    		clickOutsideDropdown,
    		changeValue,
    		keyboardGridNav,
    		document,
    		parseInt
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("values" in $$props) $$invalidate(7, values = $$props.values);
    		if ("trigger" in $$props) trigger = $$props.trigger;
    		if ("windowHeight" in $$props) $$invalidate(2, windowHeight = $$props.windowHeight);
    		if ("top" in $$props) $$invalidate(3, top = $$props.top);
    		if ("ddActive" in $$props) $$invalidate(4, ddActive = $$props.ddActive);
    		if ("ddHeight" in $$props) $$invalidate(5, ddHeight = $$props.ddHeight);
    		if ("inputHeight" in $$props) $$invalidate(6, inputHeight = $$props.inputHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		id,
    		windowHeight,
    		top,
    		ddActive,
    		ddHeight,
    		inputHeight,
    		values,
    		handleKeydown,
    		toggleDropdown,
    		clickOutsideDropdown,
    		changeValue,
    		keyboardGridNav,
    		trigger,
    		onwindowresize,
    		button_elementresize_handler,
    		click_handler,
    		keydown_handler,
    		click_handler_1,
    		div1_elementresize_handler
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get id() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function M(n,r,t){return Math.min(Math.max(n||0,r),t)}function m(n){return {r:M(n.r,0,255),g:M(n.g,0,255),b:M(n.b,0,255),a:M(n.a,0,1)}}function d(n){return {r:255*n.r,g:255*n.g,b:255*n.b,a:n.a}}function p(n){return {r:n.r/255,g:n.g/255,b:n.b/255,a:n.a}}function v(n,r){void 0===r&&(r=0);var t=Math.pow(10,r);return {r:Math.round(n.r*t)/t,g:Math.round(n.g*t)/t,b:Math.round(n.b*t)/t,a:n.a}}function x(n,r,t,u,i,o){return (1-r/t)*u+r/t*Math.round((1-n)*i+n*o)}function O(n,r,t,u,i){void 0===i&&(i={unitInput:!1,unitOutput:!1,roundOutput:!0}),i.unitInput&&(n=d(n),r=d(r)),n=m(n);var o=(r=m(r)).a+n.a-r.a*n.a,e=t(n,r,u),c=m({r:x(n.a,r.a,o,n.r,r.r,e.r),g:x(n.a,r.a,o,n.g,r.g,e.g),b:x(n.a,r.a,o,n.b,r.b,e.b),a:o});return c=i.unitOutput?p(c):i.roundOutput?v(c):function(n){return v(n,9)}(c),c}function s(n,r,t){return d(t(p(n),p(r)))}function I(n){return .3*n.r+.59*n.g+.11*n.b}function q(n,r){var t=r-I(n);return function(n){var r=I(n),t=n.r,u=n.g,i=n.b,o=Math.min(t,u,i),e=Math.max(t,u,i);function c(n){return r+(n-r)*r/(r-o)}function f(n){return r+(n-r)*(1-r)/(e-r)}return o<0&&(t=c(t),u=c(u),i=c(i)),e>1&&(t=f(t),u=f(u),i=f(i)),{r:t,g:u,b:i}}({r:n.r+t,g:n.g+t,b:n.b+t})}function y(n,r){return q(r,I(n))}function R(n,r){return O(n,r,s,y)}

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var convertHexToRgb_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertHexToRgb = void 0;
    const convertHexToRgb = (hex) => {
        const sanitisedHex = hex.replace("#", "").toLowerCase();
        if (validateHexString(sanitisedHex)) {
            const chars = [...sanitisedHex];
            return [
                parseInt(chars[0] + chars[1], 16),
                parseInt(chars[2] + chars[3], 16),
                parseInt(chars[4] + chars[5], 16),
            ];
        }
        else {
            throw new Error("Invalid HEX input");
        }
    };
    exports.convertHexToRgb = convertHexToRgb;
    const validateHexString = (hex) => {
        const regex = new RegExp(/[0-9a-f]{6}/);
        if (hex.length === 6 || regex.test(hex)) {
            return true;
        }
        return false;
    };

    });

    unwrapExports(convertHexToRgb_1);
    var convertHexToRgb_2 = convertHexToRgb_1.convertHexToRgb;

    var convertRgbToHex_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertRgbToHex = void 0;
    const convertRgbToHex = (red, green, blue) => {
        if (isValidRgb(red, green, blue)) {
            return returnHex(red) + returnHex(green) + returnHex(blue);
        }
        else {
            throw new Error("Invalid RGB input");
        }
    };
    exports.convertRgbToHex = convertRgbToHex;
    const isValidRgb = (red, green, blue) => {
        if (!isValidNumber(red) || !isValidNumber(green) || !isValidNumber(blue)) {
            return false;
        }
        return true;
    };
    const isValidNumber = (value) => {
        if (value > 255 || value < 0) {
            return false;
        }
        return true;
    };
    const returnHex = (value) => {
        if (value < 10) {
            return "0" + value.toString(16);
        }
        else {
            return value.toString(16);
        }
    };

    });

    unwrapExports(convertRgbToHex_1);
    var convertRgbToHex_2 = convertRgbToHex_1.convertRgbToHex;

    var dist = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertRgbToHex = exports.convertHexToRgb = void 0;

    Object.defineProperty(exports, "convertHexToRgb", { enumerable: true, get: function () { return convertHexToRgb_1.convertHexToRgb; } });

    Object.defineProperty(exports, "convertRgbToHex", { enumerable: true, get: function () { return convertRgbToHex_1.convertRgbToHex; } });

    });

    unwrapExports(dist);
    var dist_1 = dist.convertRgbToHex;
    var dist_2 = dist.convertHexToRgb;

    /* src\components\account\accountCardPreview.svelte generated by Svelte v3.19.1 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\account\\accountCardPreview.svelte";

    function create_fragment$1(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let strong;
    	let t1_value = /*account*/ ctx[0].username + "";
    	let t1;
    	let t2;
    	let div1;
    	let svg;
    	let rect;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			if (img.src !== (img_src_value = /*account*/ ctx[0].avatarImg)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatarImg");
    			attr_dev(img, "class", "center svelte-7z84c5");
    			add_location(img, file$1, 69, 12, 1969);
    			add_location(strong, file$1, 70, 12, 2045);
    			attr_dev(div0, "class", "text-layer svelte-7z84c5");
    			add_location(div0, file$1, 68, 8, 1931);
    			attr_dev(rect, "id", "E1");
    			attr_dev(rect, "fill", /*fill1*/ ctx[1]);
    			attr_dev(rect, "width", "1600");
    			attr_dev(rect, "height", "800");
    			attr_dev(rect, "rx", "8");
    			add_location(rect, file$1, 79, 16, 2340);
    			attr_dev(path0, "id", "E2");
    			attr_dev(path0, "fill", /*fill2*/ ctx[2]);
    			attr_dev(path0, "d", "M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z");
    			add_location(path0, file$1, 80, 16, 2420);
    			attr_dev(path1, "id", "E3");
    			attr_dev(path1, "fill", /*fill3*/ ctx[3]);
    			attr_dev(path1, "d", "M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z");
    			add_location(path1, file$1, 85, 16, 2731);
    			attr_dev(path2, "id", "E4");
    			attr_dev(path2, "fill", /*fill4*/ ctx[4]);
    			attr_dev(path2, "d", "M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z");
    			add_location(path2, file$1, 90, 16, 3038);
    			attr_dev(path3, "id", "E5");
    			attr_dev(path3, "fill", /*fill5*/ ctx[5]);
    			attr_dev(path3, "d", "M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z");
    			add_location(path3, file$1, 95, 16, 3343);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 1000 727");
    			add_location(svg, file$1, 73, 12, 2150);
    			attr_dev(div1, "class", "background-layer svelte-7z84c5");
    			add_location(div1, file$1, 72, 8, 2106);
    			attr_dev(div2, "class", "wrap-layer svelte-7z84c5");
    			add_location(div2, file$1, 67, 4, 1897);
    			attr_dev(div3, "class", "grid-container account-preview-card svelte-7z84c5");
    			add_location(div3, file$1, 66, 0, 1842);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, strong);
    			append_dev(strong, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, rect);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*account*/ 1 && img.src !== (img_src_value = /*account*/ ctx[0].avatarImg)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*account*/ 1 && t1_value !== (t1_value = /*account*/ ctx[0].username + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*fill1*/ 2) {
    				attr_dev(rect, "fill", /*fill1*/ ctx[1]);
    			}

    			if (dirty & /*fill2*/ 4) {
    				attr_dev(path0, "fill", /*fill2*/ ctx[2]);
    			}

    			if (dirty & /*fill3*/ 8) {
    				attr_dev(path1, "fill", /*fill3*/ ctx[3]);
    			}

    			if (dirty & /*fill4*/ 16) {
    				attr_dev(path2, "fill", /*fill4*/ ctx[4]);
    			}

    			if (dirty & /*fill5*/ 32) {
    				attr_dev(path3, "fill", /*fill5*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	var rgb2hex = require("rgb2hex");
    	let { account } = $$props;
    	let defaultColor = "#3c2363";
    	let fill1;
    	let fill2;
    	let fill3;
    	let fill4;
    	let fill5;
    	updateColor();

    	function updateColor() {
    		$$invalidate(1, fill1 = getGradientColor(account.color, defaultColor));
    		$$invalidate(2, fill2 = getGradientColor(defaultColor, fill1));
    		$$invalidate(3, fill3 = getGradientColor(defaultColor, fill2));
    		$$invalidate(4, fill4 = getGradientColor(defaultColor, fill3));
    		$$invalidate(5, fill5 = getGradientColor(defaultColor, fill4));
    	}

    	function getGradientColor(hex1, hex2) {
    		let rgbaArray = dist_2(hex1);

    		let rgb = {
    			r: rgbaArray[0],
    			g: rgbaArray[1],
    			b: rgbaArray[2],
    			a: 0.7
    		};

    		console.log("original1:");
    		console.log(rgb);
    		let rgbaArray2 = dist_2(hex2);

    		let rgb2 = {
    			r: rgbaArray2[0],
    			g: rgbaArray2[1],
    			b: rgbaArray2[2],
    			a: 0.4
    		};

    		console.log("original2:");
    		console.log(rgb2);
    		let colorResult = R(rgb, rgb2);
    		console.log("final:");
    		console.log(colorResult);
    		console.log(rgb2hex("rgb(" + colorResult.r + "," + colorResult.g + "," + colorResult.b + ")").hex);
    		return rgb2hex("rgb(" + colorResult.r + "," + colorResult.g + "," + colorResult.b + ")").hex;
    	}

    	const writable_props = ["account"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AccountCardPreview> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("account" in $$props) $$invalidate(0, account = $$props.account);
    	};

    	$$self.$capture_state = () => ({
    		color: R,
    		convertHexToRgb: dist_2,
    		rgb2hex,
    		account,
    		defaultColor,
    		fill1,
    		fill2,
    		fill3,
    		fill4,
    		fill5,
    		updateColor,
    		getGradientColor,
    		require,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("rgb2hex" in $$props) rgb2hex = $$props.rgb2hex;
    		if ("account" in $$props) $$invalidate(0, account = $$props.account);
    		if ("defaultColor" in $$props) defaultColor = $$props.defaultColor;
    		if ("fill1" in $$props) $$invalidate(1, fill1 = $$props.fill1);
    		if ("fill2" in $$props) $$invalidate(2, fill2 = $$props.fill2);
    		if ("fill3" in $$props) $$invalidate(3, fill3 = $$props.fill3);
    		if ("fill4" in $$props) $$invalidate(4, fill4 = $$props.fill4);
    		if ("fill5" in $$props) $$invalidate(5, fill5 = $$props.fill5);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 {
    		updateColor();
    	}

    	return [account, fill1, fill2, fill3, fill4, fill5];
    }

    class AccountCardPreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { account: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCardPreview",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[0] === undefined && !("account" in props)) {
    			console_1.warn("<AccountCardPreview> was created without expected prop 'account'");
    		}
    	}

    	get account() {
    		throw new Error("<AccountCardPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set account(value) {
    		throw new Error("<AccountCardPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\account\accountCard.svelte generated by Svelte v3.19.1 */
    const file$2 = "src\\components\\account\\accountCard.svelte";

    // (28:2) {#if showDetails}
    function create_if_block_1(ctx) {
    	let div7;
    	let div6;
    	let i0;
    	let t0;
    	let br0;
    	let t1;
    	let div2;
    	let div1;
    	let div0;
    	let button0;
    	let t2;
    	let input0;
    	let t3;
    	let div5;
    	let div4;
    	let div3;
    	let button1;
    	let t4;
    	let input1;
    	let t5;
    	let br1;
    	let t6;
    	let updating_value;
    	let t7;
    	let button2;
    	let t8;
    	let i1;
    	let current;
    	let dispose;

    	function colorpicker_value_binding(value) {
    		/*colorpicker_value_binding*/ ctx[6].call(null, value);
    	}

    	let colorpicker_props = {};

    	if (/*account*/ ctx[0].color !== void 0) {
    		colorpicker_props.value = /*account*/ ctx[0].color;
    	}

    	const colorpicker = new ColorPicker({ props: colorpicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorpicker, "value", colorpicker_value_binding));

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			i0 = element("i");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			button1 = element("button");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			create_component(colorpicker.$$.fragment);
    			t7 = space();
    			button2 = element("button");
    			t8 = text("Sign in ");
    			i1 = element("i");
    			attr_dev(i0, "class", "bi bi-x-square icon-red svelte-t9gtfp");
    			add_location(i0, file$2, 30, 8, 785);
    			add_location(br0, file$2, 31, 8, 832);
    			attr_dev(button0, "class", "bi bi-clipboard-check btn btn-dark");
    			add_location(button0, file$2, 35, 14, 985);
    			attr_dev(div0, "class", "input-group-prepend");
    			add_location(div0, file$2, 34, 12, 936);
    			attr_dev(input0, "class", "form-control svelte-t9gtfp");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file$2, 37, 12, 1072);
    			attr_dev(div1, "class", "input-group mb-3");
    			add_location(div1, file$2, 33, 10, 892);
    			attr_dev(div2, "class", "default-margin-top svelte-t9gtfp");
    			add_location(div2, file$2, 32, 8, 848);
    			attr_dev(button1, "class", "bi bi-clipboard-check btn btn-dark");
    			add_location(button1, file$2, 48, 14, 1401);
    			attr_dev(div3, "class", "input-group-prepend");
    			add_location(div3, file$2, 47, 12, 1352);
    			attr_dev(input1, "class", "form-control svelte-t9gtfp");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file$2, 50, 12, 1488);
    			attr_dev(div4, "class", "input-group flex-nowrap");
    			add_location(div4, file$2, 46, 10, 1301);
    			add_location(br1, file$2, 57, 10, 1690);
    			add_location(div5, file$2, 45, 8, 1284);
    			attr_dev(i1, "class", "bi bi-box-arrow-in-right run");
    			add_location(i1, file$2, 61, 19, 1826);
    			attr_dev(button2, "class", "btn btn-success");
    			add_location(button2, file$2, 60, 8, 1774);
    			attr_dev(div6, "class", "grid-container account-card svelte-t9gtfp");
    			add_location(div6, file$2, 29, 6, 734);
    			attr_dev(div7, "class", "relative-wrap svelte-t9gtfp");
    			add_location(div7, file$2, 28, 4, 699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, i0);
    			append_dev(div6, t0);
    			append_dev(div6, br0);
    			append_dev(div6, t1);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div1, t2);
    			append_dev(div1, input0);
    			set_input_value(input0, /*account*/ ctx[0].username);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(div4, t4);
    			append_dev(div4, input1);
    			set_input_value(input1, /*account*/ ctx[0].password);
    			append_dev(div5, t5);
    			append_dev(div5, br1);
    			append_dev(div6, t6);
    			mount_component(colorpicker, div6, null);
    			append_dev(div6, t7);
    			append_dev(div6, button2);
    			append_dev(button2, t8);
    			append_dev(button2, i1);
    			current = true;

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*account*/ 1 && input0.value !== /*account*/ ctx[0].username) {
    				set_input_value(input0, /*account*/ ctx[0].username);
    			}

    			if (dirty & /*account*/ 1 && input1.value !== /*account*/ ctx[0].password) {
    				set_input_value(input1, /*account*/ ctx[0].password);
    			}

    			const colorpicker_changes = {};

    			if (!updating_value && dirty & /*account*/ 1) {
    				updating_value = true;
    				colorpicker_changes.value = /*account*/ ctx[0].color;
    				add_flush_callback(() => updating_value = false);
    			}

    			colorpicker.$set(colorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_component(colorpicker);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(28:2) {#if showDetails}",
    		ctx
    	});

    	return block;
    }

    // (68:2) {#if !showDetails}
    function create_if_block$1(ctx) {
    	let current;

    	const accountcardpreview = new AccountCardPreview({
    			props: { account: /*account*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(accountcardpreview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accountcardpreview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accountcardpreview_changes = {};
    			if (dirty & /*account*/ 1) accountcardpreview_changes.account = /*account*/ ctx[0];
    			accountcardpreview.$set(accountcardpreview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accountcardpreview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accountcardpreview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accountcardpreview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(68:2) {#if !showDetails}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let t;
    	let current;
    	let dispose;
    	let if_block0 = /*showDetails*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = !/*showDetails*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(main, file$2, 26, 0, 600);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t);
    			if (if_block1) if_block1.m(main, null);
    			current = true;

    			dispose = [
    				listen_dev(main, "mouseenter", /*handleMouseEnter*/ ctx[2], false, false, false),
    				listen_dev(main, "mouseleave", /*handleMouseLeave*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showDetails*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*showDetails*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { account } = $$props;

    	if (account == undefined) {
    		account = {
    			color: "#ff5733",
    			username: "User!",
    			password: "password!",
    			avatarImg: "https://avatars.cloudflare.steamstatic.com/36753f040208dc4a99a5d97f6fbee6a24f83a316_full.jpg"
    		};
    	}

    	let showDetails = false;

    	function handleMouseEnter(e) {
    		$$invalidate(1, showDetails = true);
    	}

    	function handleMouseLeave(e) {
    		$$invalidate(1, showDetails = false);
    	}

    	const writable_props = ["account"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AccountCard> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		account.username = this.value;
    		$$invalidate(0, account);
    	}

    	function input1_input_handler() {
    		account.password = this.value;
    		$$invalidate(0, account);
    	}

    	function colorpicker_value_binding(value) {
    		account.color = value;
    		$$invalidate(0, account);
    	}

    	$$self.$set = $$props => {
    		if ("account" in $$props) $$invalidate(0, account = $$props.account);
    	};

    	$$self.$capture_state = () => ({
    		ColorPicker,
    		AccountCardPreview,
    		account,
    		showDetails,
    		handleMouseEnter,
    		handleMouseLeave,
    		undefined
    	});

    	$$self.$inject_state = $$props => {
    		if ("account" in $$props) $$invalidate(0, account = $$props.account);
    		if ("showDetails" in $$props) $$invalidate(1, showDetails = $$props.showDetails);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		account,
    		showDetails,
    		handleMouseEnter,
    		handleMouseLeave,
    		input0_input_handler,
    		input1_input_handler,
    		colorpicker_value_binding
    	];
    }

    class AccountCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { account: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[0] === undefined && !("account" in props)) {
    			console.warn("<AccountCard> was created without expected prop 'account'");
    		}
    	}

    	get account() {
    		throw new Error("<AccountCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set account(value) {
    		throw new Error("<AccountCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\account\addAccountCard.svelte generated by Svelte v3.19.1 */

    const file$3 = "src\\components\\account\\addAccountCard.svelte";

    // (17:2) {#if !isAddOpen}
    function create_if_block_1$1(ctx) {
    	let div;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "+";
    			add_location(p, file$3, 18, 6, 353);
    			attr_dev(div, "class", "grid-container center add-card svelte-bb68bq");
    			add_location(div, file$3, 17, 4, 277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			dispose = listen_dev(div, "click", /*onAddClicked*/ ctx[3], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(17:2) {#if !isAddOpen}",
    		ctx
    	});

    	return block;
    }

    // (22:2) {#if isAddOpen}
    function create_if_block$2(ctx) {
    	let div;
    	let i0;
    	let t0;
    	let br0;
    	let t1;
    	let i1;
    	let t2;
    	let input0;
    	let t3;
    	let br1;
    	let t4;
    	let i2;
    	let t5;
    	let input1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i0 = element("i");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			i1 = element("i");
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			i2 = element("i");
    			t5 = space();
    			input1 = element("input");
    			attr_dev(i0, "class", "bi bi-x-square icon-red svelte-bb68bq");
    			add_location(i0, file$3, 23, 6, 477);
    			add_location(br0, file$3, 24, 6, 551);
    			attr_dev(i1, "class", "bi bi-clipboard-check");
    			add_location(i1, file$3, 25, 6, 565);
    			attr_dev(input0, "placeholder", "Enter username");
    			attr_dev(input0, "class", "svelte-bb68bq");
    			add_location(input0, file$3, 26, 6, 608);
    			add_location(br1, file$3, 27, 6, 676);
    			attr_dev(i2, "class", "bi bi-clipboard-check");
    			add_location(i2, file$3, 28, 6, 690);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-bb68bq");
    			add_location(input1, file$3, 29, 6, 733);
    			attr_dev(div, "class", "grid-container center account-card card-gradient svelte-bb68bq");
    			add_location(div, file$3, 22, 4, 407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i0);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, i1);
    			append_dev(div, t2);
    			append_dev(div, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(div, t3);
    			append_dev(div, br1);
    			append_dev(div, t4);
    			append_dev(div, i2);
    			append_dev(div, t5);
    			append_dev(div, input1);
    			set_input_value(input1, /*password*/ ctx[1]);

    			dispose = [
    				listen_dev(i0, "click", /*onAddCloseClicked*/ ctx[4], false, false, false),
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[6])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(22:2) {#if isAddOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let t;
    	let if_block0 = !/*isAddOpen*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block1 = /*isAddOpen*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(main, file$3, 15, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t);
    			if (if_block1) if_block1.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*isAddOpen*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(main, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*isAddOpen*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let username;
    	let password;
    	let isAddOpen = false;

    	function onAddClicked() {
    		if (isAddOpen == false) {
    			$$invalidate(2, isAddOpen = true);
    		}
    	}

    	function onAddCloseClicked() {
    		$$invalidate(2, isAddOpen = false);
    	}

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		username,
    		password,
    		isAddOpen,
    		onAddClicked,
    		onAddCloseClicked
    	});

    	$$self.$inject_state = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    		if ("isAddOpen" in $$props) $$invalidate(2, isAddOpen = $$props.isAddOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		username,
    		password,
    		isAddOpen,
    		onAddClicked,
    		onAddCloseClicked,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class AddAccountCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddAccountCard",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\account\accountCardGrid.svelte generated by Svelte v3.19.1 */
    const file$4 = "src\\components\\account\\accountCardGrid.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const accountcard0 = new AccountCard({
    			props: {
    				fill1: "#336ab1",
    				fill2: "#5771cd",
    				fill3: "#8275e3",
    				fill4: "#b274f2",
    				fill5: "#e56efa"
    			},
    			$$inline: true
    		});

    	const accountcard1 = new AccountCard({ $$inline: true });
    	const accountcard2 = new AccountCard({ $$inline: true });
    	const addaccountcard = new AddAccountCard({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(accountcard0.$$.fragment);
    			t0 = space();
    			create_component(accountcard1.$$.fragment);
    			t1 = space();
    			create_component(accountcard2.$$.fragment);
    			t2 = space();
    			create_component(addaccountcard.$$.fragment);
    			attr_dev(div0, "class", "grid-container svelte-1pu1711");
    			add_location(div0, file$4, 7, 2, 172);
    			attr_dev(div1, "class", "container-center svelte-1pu1711");
    			add_location(div1, file$4, 6, 1, 138);
    			add_location(main, file$4, 5, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			mount_component(accountcard0, div0, null);
    			append_dev(div0, t0);
    			mount_component(accountcard1, div0, null);
    			append_dev(div0, t1);
    			mount_component(accountcard2, div0, null);
    			append_dev(div0, t2);
    			mount_component(addaccountcard, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accountcard0.$$.fragment, local);
    			transition_in(accountcard1.$$.fragment, local);
    			transition_in(accountcard2.$$.fragment, local);
    			transition_in(addaccountcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accountcard0.$$.fragment, local);
    			transition_out(accountcard1.$$.fragment, local);
    			transition_out(accountcard2.$$.fragment, local);
    			transition_out(addaccountcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(accountcard0);
    			destroy_component(accountcard1);
    			destroy_component(accountcard2);
    			destroy_component(addaccountcard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	$$self.$capture_state = () => ({ AccountCard, AddAccountCard });
    	return [];
    }

    class AccountCardGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCardGrid",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$5 = "src\\App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let current;
    	const accountcardgrid = new AccountCardGrid({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(accountcardgrid.$$.fragment);
    			attr_dev(main, "class", "svelte-6wjt63");
    			add_location(main, file$5, 10, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(accountcardgrid, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accountcardgrid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accountcardgrid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(accountcardgrid);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const { ipcRenderer } = require("electron");
    	let accounts = ipcRenderer.sendSync("get-accounts");

    	if (ipcRenderer != null && ipcRenderer != undefined) {
    		console.log("life is good!");
    	}

    	$$self.$capture_state = () => ({
    		AccountCardGrid,
    		ipcRenderer,
    		accounts,
    		require,
    		undefined,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("accounts" in $$props) accounts = $$props.accounts;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

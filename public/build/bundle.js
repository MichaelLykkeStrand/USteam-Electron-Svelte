
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

    /* src\components\account\accountCard.svelte generated by Svelte v3.19.1 */

    const file = "src\\components\\account\\accountCard.svelte";

    function create_fragment(ctx) {
    	let main;
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
    	let t6;
    	let br2;
    	let t7;
    	let button0;
    	let i3;
    	let t8;
    	let button1;
    	let t9;
    	let i4;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
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
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			button0 = element("button");
    			i3 = element("i");
    			t8 = space();
    			button1 = element("button");
    			t9 = text("Sign in ");
    			i4 = element("i");
    			attr_dev(i0, "class", "bi bi-x-square icon-red svelte-1g565p9");
    			add_location(i0, file, 13, 4, 251);
    			add_location(br0, file, 14, 4, 296);
    			attr_dev(i1, "class", "bi bi-clipboard-check");
    			add_location(i1, file, 15, 4, 307);
    			attr_dev(input0, "placeholder", "Enter username");
    			attr_dev(input0, "class", "svelte-1g565p9");
    			add_location(input0, file, 16, 4, 350);
    			add_location(br1, file, 17, 4, 414);
    			attr_dev(i2, "class", "bi bi-clipboard-check");
    			add_location(i2, file, 18, 4, 425);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-1g565p9");
    			add_location(input1, file, 19, 4, 468);
    			add_location(br2, file, 20, 4, 542);
    			attr_dev(i3, "class", "bi bi-palette");
    			add_location(i3, file, 22, 6, 617);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-outline-secondary");
    			add_location(button0, file, 21, 4, 553);
    			attr_dev(i4, "class", "bi bi-box-arrow-in-right run");
    			add_location(i4, file, 24, 44, 707);
    			attr_dev(button1, "class", "btn btn-success");
    			add_location(button1, file, 24, 4, 667);
    			attr_dev(div, "class", "grid-container center account-card card-gradient svelte-1g565p9");
    			add_location(div, file, 12, 1, 183);
    			add_location(main, file, 11, 0, 174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
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
    			append_dev(div, t6);
    			append_dev(div, br2);
    			append_dev(div, t7);
    			append_dev(div, button0);
    			append_dev(button0, i3);
    			append_dev(div, t8);
    			append_dev(div, button1);
    			append_dev(button1, t9);
    			append_dev(button1, i4);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function handleLoginClick(e) {
    	
    }

    function instance($$self, $$props, $$invalidate) {
    	let { account } = $$props;
    	let username = "MyUser";
    	let password = "MyPassword";
    	let showDetails = false;
    	const writable_props = ["account"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AccountCard> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$set = $$props => {
    		if ("account" in $$props) $$invalidate(2, account = $$props.account);
    	};

    	$$self.$capture_state = () => ({
    		account,
    		username,
    		password,
    		showDetails,
    		handleLoginClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("account" in $$props) $$invalidate(2, account = $$props.account);
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    		if ("showDetails" in $$props) showDetails = $$props.showDetails;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		username,
    		password,
    		account,
    		showDetails,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class AccountCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { account: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCard",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[2] === undefined && !("account" in props)) {
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

    const file$1 = "src\\components\\account\\addAccountCard.svelte";

    // (18:4) {#if !isAddOpen}
    function create_if_block_1(ctx) {
    	let div;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "+";
    			add_location(p, file$1, 19, 8, 384);
    			attr_dev(div, "class", "grid-container center add-card svelte-16z9dxr");
    			add_location(div, file$1, 18, 1, 306);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:4) {#if !isAddOpen}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if isAddOpen}
    function create_if_block(ctx) {
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
    			attr_dev(i0, "class", "bi bi-x-square icon-red svelte-16z9dxr");
    			add_location(i0, file$1, 24, 8, 511);
    			add_location(br0, file$1, 25, 8, 589);
    			attr_dev(i1, "class", "bi bi-clipboard-check");
    			add_location(i1, file$1, 26, 8, 604);
    			attr_dev(input0, "placeholder", "Enter username");
    			attr_dev(input0, "class", "svelte-16z9dxr");
    			add_location(input0, file$1, 27, 8, 651);
    			add_location(br1, file$1, 28, 8, 719);
    			attr_dev(i2, "class", "bi bi-clipboard-check");
    			add_location(i2, file$1, 29, 8, 734);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-16z9dxr");
    			add_location(input1, file$1, 30, 8, 781);
    			attr_dev(div, "class", "grid-container center account-card card-gradient svelte-16z9dxr");
    			add_location(div, file$1, 23, 4, 439);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:4) {#if isAddOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let t;
    	let if_block0 = !/*isAddOpen*/ ctx[2] && create_if_block_1(ctx);
    	let if_block1 = /*isAddOpen*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(main, file$1, 16, 0, 275);
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
    					if_block0 = create_if_block_1(ctx);
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
    					if_block1 = create_if_block(ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddAccountCard",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\account\accountCardGrid.svelte generated by Svelte v3.19.1 */
    const file$2 = "src\\components\\account\\accountCardGrid.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const accountcard0 = new AccountCard({ $$inline: true });
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
    			attr_dev(div0, "class", "grid-container svelte-1uuymtl");
    			add_location(div0, file$2, 7, 2, 172);
    			attr_dev(div1, "class", "container-center svelte-1uuymtl");
    			add_location(div1, file$2, 6, 1, 138);
    			add_location(main, file$2, 5, 0, 129);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	$$self.$capture_state = () => ({ AccountCard, AddAccountCard });
    	return [];
    }

    class AccountCardGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCardGrid",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$3 = "src\\App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let current;
    	const accountcardgrid = new AccountCardGrid({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(accountcardgrid.$$.fragment);
    			attr_dev(main, "class", "svelte-6wjt63");
    			add_location(main, file$3, 10, 0, 294);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

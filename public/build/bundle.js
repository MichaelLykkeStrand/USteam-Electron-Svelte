
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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

    const globals = (typeof window !== 'undefined' ? window : global);
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

    function n(n,r,t){return {r:255*t(n.r/255,r.r/255),g:255*t(n.g/255,r.g/255),b:255*t(n.b/255,r.b/255)}}function r(n,r){return r}function M(n,r,t){return Math.min(Math.max(n||0,r),t)}function m(n){return {r:M(n.r,0,255),g:M(n.g,0,255),b:M(n.b,0,255),a:M(n.a,0,1)}}function d(n){return {r:255*n.r,g:255*n.g,b:255*n.b,a:n.a}}function p(n){return {r:n.r/255,g:n.g/255,b:n.b/255,a:n.a}}function v(n,r){void 0===r&&(r=0);var t=Math.pow(10,r);return {r:Math.round(n.r*t)/t,g:Math.round(n.g*t)/t,b:Math.round(n.b*t)/t,a:n.a}}function x(n,r,t,u,i,o){return (1-r/t)*u+r/t*Math.round((1-n)*i+n*o)}function O(n,r,t,u,i){void 0===i&&(i={unitInput:!1,unitOutput:!1,roundOutput:!0}),i.unitInput&&(n=d(n),r=d(r)),n=m(n);var o=(r=m(r)).a+n.a-r.a*n.a,e=t(n,r,u),c=m({r:x(n.a,r.a,o,n.r,r.r,e.r),g:x(n.a,r.a,o,n.g,r.g,e.g),b:x(n.a,r.a,o,n.b,r.b,e.b),a:o});return c=i.unitOutput?p(c):i.roundOutput?v(c):function(n){return v(n,9)}(c),c}function A(t,u){return O(t,u,n,r)}

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

    /* src\components\account\accountCard.svelte generated by Svelte v3.19.1 */

    const { console: console_1 } = globals;
    const file = "src\\components\\account\\accountCard.svelte";

    // (44:2) {#if showDetails}
    function create_if_block_1(ctx) {
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
    	let button2;
    	let i1;
    	let t7;
    	let button3;
    	let t8;
    	let i2;
    	let dispose;

    	const block = {
    		c: function create() {
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
    			button2 = element("button");
    			i1 = element("i");
    			t7 = space();
    			button3 = element("button");
    			t8 = text("Sign in ");
    			i2 = element("i");
    			attr_dev(i0, "class", "bi bi-x-square icon-red svelte-1chuael");
    			add_location(i0, file, 45, 6, 1313);
    			add_location(br0, file, 46, 6, 1358);
    			attr_dev(button0, "class", "bi bi-clipboard-check btn btn-dark");
    			add_location(button0, file, 50, 12, 1503);
    			attr_dev(div0, "class", "input-group-prepend");
    			add_location(div0, file, 49, 10, 1456);
    			attr_dev(input0, "class", "form-control svelte-1chuael");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			add_location(input0, file, 52, 10, 1586);
    			attr_dev(div1, "class", "input-group mb-3");
    			add_location(div1, file, 48, 8, 1414);
    			attr_dev(div2, "class", "default-margin-top svelte-1chuael");
    			add_location(div2, file, 47, 6, 1372);
    			attr_dev(button1, "class", "bi bi-clipboard-check btn btn-dark");
    			add_location(button1, file, 58, 12, 1822);
    			attr_dev(div3, "class", "input-group-prepend");
    			add_location(div3, file, 57, 10, 1775);
    			attr_dev(input1, "class", "form-control svelte-1chuael");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file, 60, 10, 1905);
    			attr_dev(div4, "class", "input-group flex-nowrap");
    			add_location(div4, file, 56, 8, 1726);
    			add_location(br1, file, 62, 8, 2022);
    			add_location(div5, file, 55, 6, 1711);
    			attr_dev(i1, "class", "bi bi-palette");
    			add_location(i1, file, 65, 8, 2116);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "btn btn-outline-secondary");
    			add_location(button2, file, 64, 6, 2050);
    			attr_dev(i2, "class", "bi bi-box-arrow-in-right run");
    			add_location(i2, file, 68, 17, 2218);
    			attr_dev(button3, "class", "btn btn-success");
    			add_location(button3, file, 67, 6, 2168);
    			attr_dev(div6, "class", "grid-container account-card svelte-1chuael");
    			add_location(div6, file, 44, 4, 1264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
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
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(div4, t4);
    			append_dev(div4, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(div5, t5);
    			append_dev(div5, br1);
    			append_dev(div6, t6);
    			append_dev(div6, button2);
    			append_dev(button2, i1);
    			append_dev(div6, t7);
    			append_dev(div6, button3);
    			append_dev(button3, t8);
    			append_dev(button3, i2);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[18]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[19])
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
    			if (detaching) detach_dev(div6);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(44:2) {#if showDetails}",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if !showDetails}
    function create_if_block(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let strong;
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
    			t1 = text(/*username*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			if (img.src !== (img_src_value = /*avatarImg*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatarImg");
    			attr_dev(img, "class", "center svelte-1chuael");
    			add_location(img, file, 76, 10, 2453);
    			add_location(strong, file, 77, 10, 2519);
    			attr_dev(div0, "class", "text-layer svelte-1chuael");
    			add_location(div0, file, 75, 8, 2417);
    			attr_dev(rect, "id", "E1");
    			attr_dev(rect, "fill", /*fill1*/ ctx[4]);
    			attr_dev(rect, "width", "1600");
    			attr_dev(rect, "height", "800");
    			attr_dev(rect, "rx", "8");
    			add_location(rect, file, 86, 12, 2782);
    			attr_dev(path0, "id", "E2");
    			attr_dev(path0, "fill", /*fill2*/ ctx[5]);
    			attr_dev(path0, "d", "M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z");
    			add_location(path0, file, 87, 12, 2858);
    			attr_dev(path1, "id", "E3");
    			attr_dev(path1, "fill", /*fill3*/ ctx[6]);
    			attr_dev(path1, "d", "M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z");
    			add_location(path1, file, 92, 12, 3143);
    			attr_dev(path2, "id", "E4");
    			attr_dev(path2, "fill", /*fill4*/ ctx[7]);
    			attr_dev(path2, "d", "M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z");
    			add_location(path2, file, 97, 12, 3424);
    			attr_dev(path3, "id", "E5");
    			attr_dev(path3, "fill", /*fill5*/ ctx[8]);
    			attr_dev(path3, "d", "M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z");
    			add_location(path3, file, 102, 12, 3703);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 1000 727");
    			add_location(svg, file, 80, 10, 2614);
    			attr_dev(div1, "class", "background-layer svelte-1chuael");
    			add_location(div1, file, 79, 8, 2572);
    			attr_dev(div2, "class", "wrap-layer svelte-1chuael");
    			add_location(div2, file, 74, 6, 2383);
    			attr_dev(div3, "class", "grid-container account-preview-card svelte-1chuael");
    			add_location(div3, file, 73, 4, 2326);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1) set_data_dev(t1, /*username*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(73:2) {#if !showDetails}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t;
    	let dispose;
    	let if_block0 = /*showDetails*/ ctx[2] && create_if_block_1(ctx);
    	let if_block1 = !/*showDetails*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(main, file, 42, 0, 1165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t);
    			if (if_block1) if_block1.m(main, null);

    			dispose = [
    				listen_dev(main, "mouseenter", /*handleMouseEnter*/ ctx[9], false, false, false),
    				listen_dev(main, "mouseleave", /*handleMouseLeave*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showDetails*/ ctx[2]) {
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

    			if (!/*showDetails*/ ctx[2]) {
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
    	let { account } = $$props;

    	if (account == undefined) {
    		account = {};
    		account.color = "#fafa6e";
    	}

    	let username = "MyUser";
    	let password = "MyPassword";
    	let avatarImg = "https://avatars.cloudflare.steamstatic.com/36753f040208dc4a99a5d97f6fbee6a24f83a316_full.jpg";
    	let showDetails = false;
    	let rgbaArray = dist_2("#482a58");

    	let rgb = {
    		r: rgbaArray[0],
    		g: rgbaArray[1],
    		b: rgbaArray[2],
    		a: 1
    	};

    	console.log(rgb);
    	let rgbaArray2 = dist_2(account.color);

    	let rgb2 = {
    		r: rgbaArray2[0],
    		g: rgbaArray2[1],
    		b: rgbaArray2[2],
    		a: 1
    	};

    	console.log(rgb2);
    	let color = A(rgb, rgb2);
    	console.log(color);
    	let hexColor = "#" + dist_1(color.r, color.g, color.b);
    	console.log("hex: " + hexColor);
    	let fill1 = hexColor;
    	let fill2 = "#482a58";
    	let fill3 = "#482a58";
    	let fill4 = "#482a58";
    	let fill5 = "#482a58";

    	function handleMouseEnter(e) {
    		$$invalidate(2, showDetails = true);
    	}

    	function handleMouseLeave(e) {
    		$$invalidate(2, showDetails = false);
    	}

    	const writable_props = ["account"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AccountCard> was created with unknown prop '${key}'`);
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
    		if ("account" in $$props) $$invalidate(11, account = $$props.account);
    	};

    	$$self.$capture_state = () => ({
    		normal: A,
    		convertRgbToHex: dist_1,
    		convertHexToRgb: dist_2,
    		account,
    		username,
    		password,
    		avatarImg,
    		showDetails,
    		rgbaArray,
    		rgb,
    		rgbaArray2,
    		rgb2,
    		color,
    		hexColor,
    		fill1,
    		fill2,
    		fill3,
    		fill4,
    		fill5,
    		handleMouseEnter,
    		handleMouseLeave,
    		undefined,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("account" in $$props) $$invalidate(11, account = $$props.account);
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    		if ("avatarImg" in $$props) $$invalidate(3, avatarImg = $$props.avatarImg);
    		if ("showDetails" in $$props) $$invalidate(2, showDetails = $$props.showDetails);
    		if ("rgbaArray" in $$props) rgbaArray = $$props.rgbaArray;
    		if ("rgb" in $$props) rgb = $$props.rgb;
    		if ("rgbaArray2" in $$props) rgbaArray2 = $$props.rgbaArray2;
    		if ("rgb2" in $$props) rgb2 = $$props.rgb2;
    		if ("color" in $$props) color = $$props.color;
    		if ("hexColor" in $$props) hexColor = $$props.hexColor;
    		if ("fill1" in $$props) $$invalidate(4, fill1 = $$props.fill1);
    		if ("fill2" in $$props) $$invalidate(5, fill2 = $$props.fill2);
    		if ("fill3" in $$props) $$invalidate(6, fill3 = $$props.fill3);
    		if ("fill4" in $$props) $$invalidate(7, fill4 = $$props.fill4);
    		if ("fill5" in $$props) $$invalidate(8, fill5 = $$props.fill5);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		username,
    		password,
    		showDetails,
    		avatarImg,
    		fill1,
    		fill2,
    		fill3,
    		fill4,
    		fill5,
    		handleMouseEnter,
    		handleMouseLeave,
    		account,
    		rgbaArray,
    		rgb,
    		rgbaArray2,
    		rgb2,
    		color,
    		hexColor,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class AccountCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { account: 11 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCard",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[11] === undefined && !("account" in props)) {
    			console_1.warn("<AccountCard> was created without expected prop 'account'");
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
    			add_location(p, file$1, 18, 6, 353);
    			attr_dev(div, "class", "grid-container center add-card svelte-bb68bq");
    			add_location(div, file$1, 17, 4, 277);
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
    function create_if_block$1(ctx) {
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
    			add_location(i0, file$1, 23, 6, 477);
    			add_location(br0, file$1, 24, 6, 551);
    			attr_dev(i1, "class", "bi bi-clipboard-check");
    			add_location(i1, file$1, 25, 6, 565);
    			attr_dev(input0, "placeholder", "Enter username");
    			attr_dev(input0, "class", "svelte-bb68bq");
    			add_location(input0, file$1, 26, 6, 608);
    			add_location(br1, file$1, 27, 6, 676);
    			attr_dev(i2, "class", "bi bi-clipboard-check");
    			add_location(i2, file$1, 28, 6, 690);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-bb68bq");
    			add_location(input1, file$1, 29, 6, 733);
    			attr_dev(div, "class", "grid-container center account-card card-gradient svelte-bb68bq");
    			add_location(div, file$1, 22, 4, 407);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(22:2) {#if isAddOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let t;
    	let if_block0 = !/*isAddOpen*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block1 = /*isAddOpen*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(main, file$1, 15, 0, 245);
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
    					if_block1 = create_if_block$1(ctx);
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
    			add_location(div0, file$2, 7, 2, 172);
    			attr_dev(div1, "class", "container-center svelte-1pu1711");
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

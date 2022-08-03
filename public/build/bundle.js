
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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

    class ColorGenerator {
        static getRandomColor() {
            let letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    }

    class Account {
        constructor(newName, newPassword, bundle, color) {
          this.name = newName;
          this.password = newPassword;
          this.bundle = bundle;

          if(color === undefined){
            this._color = ColorGenerator.getRandomColor();
          } else{
            this._color = color;
          }
        }
      
        toString() {
          return "\n Username: " + this.name;
        }
      }

    const {app} = require('electron');


    class AccountRepository {
      constructor(store, callback){
        this.listener = callback;
        this.store = store;
        this.init();
      }
      
      init() {
        let tempAccounts = this.store.get('accounts');
        console.log(app.getPath('userData'));
        this.accounts = [];
        if (tempAccounts == null) {
          console.log("Accounts could not be loaded. Creating empty!");
          return false;
        } else {
          tempAccounts.forEach(obj => {
            this.accounts.push(new Account(obj._name, obj._password, obj._steamURL, obj._color));
          });
          this.accounts.sort(compare);
          console.log("Accounts loaded: " + this.accounts);
          this.save();
          return true;
        }
      }

      save() {
          try { this.listener.onDataSaved(); } catch { }
          this.accounts.sort(compare);
          this.store.set('accounts', this.accounts);
          console.log("Saving accounts: " + this.accounts);
      }

      add(newAccount){
          console.log("add account called");
          let exists = false;
          this.accounts.forEach(account => {
            if (account._name == newAccount._name) {
              exists = true;
            }
          });
          //Check for valid name and create user
          if (newAccount._name != "" && newAccount._password != "" && exists != true) {
            this.accounts.push(new Account(newAccount._name, newAccount._password, newAccount._steamURL, newAccount._color));
            this.save();
            console.log("Account added: " + newAccount._name);
            return true;
          } else {
            console.log("Could not add account!");
            return false;
          }
      }

      remove(username){
          console.log("Remove account: " + username);
          this.accounts.forEach(account => {
            if (account._name == username) {
              this.accounts = this.accounts.filter(function (item) {
                return item._name !== username;
              });
              this.save();
              console.log("Account removed");
              return true;
            }
          });
          return false;
      }

      getAll(){
          let tempAccounts = [];
          this.accounts.sort(compare);
          this.accounts.forEach(account => {
            let safeAccount = JSON.parse(JSON.stringify(account));
            tempAccounts.push(safeAccount);
          });
          return tempAccounts;
      }
    }

    function compare(a, b) {
      var nameA = a._name.toUpperCase();
      var nameB = b._name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }

    /* src\components\accountCardGrid.svelte generated by Svelte v3.19.1 */

    const file = "src\\components\\accountCardGrid.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `Hello ${account.name}!`;
    			add_location(h1, file, 6, 1, 58);
    			add_location(main, file, 5, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
    	let { accounts } = $$props;
    	const writable_props = ["accounts"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AccountCardGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("accounts" in $$props) $$invalidate(0, accounts = $$props.accounts);
    	};

    	$$self.$capture_state = () => ({ accounts });

    	$$self.$inject_state = $$props => {
    		if ("accounts" in $$props) $$invalidate(0, accounts = $$props.accounts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [accounts];
    }

    class AccountCardGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { accounts: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AccountCardGrid",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accounts*/ ctx[0] === undefined && !("accounts" in props)) {
    			console.warn("<AccountCardGrid> was created without expected prop 'accounts'");
    		}
    	}

    	get accounts() {
    		throw new Error("<AccountCardGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accounts(value) {
    		throw new Error("<AccountCardGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$1 = "src\\App.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let h1;
    	let t5;
    	let p;
    	let t6;
    	let a;
    	let t8;
    	let current;
    	const accountcardgrid = new AccountCardGrid({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = text("for\n\t");
    			create_component(accountcardgrid.$$.fragment);
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = `Hello ${name}!`;
    			t5 = space();
    			p = element("p");
    			t6 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t8 = text(" to learn how to build Svelte apps.");
    			attr_dev(h1, "class", "svelte-2x1evt");
    			add_location(h1, file$1, 13, 1, 361);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file$1, 14, 14, 398);
    			add_location(p, file$1, 14, 1, 385);
    			attr_dev(main, "class", "svelte-2x1evt");
    			add_location(main, file$1, 10, 0, 311);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, t0);
    			mount_component(accountcardgrid, main, null);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(main, t5);
    			append_dev(main, p);
    			append_dev(p, t6);
    			append_dev(p, a);
    			append_dev(p, t8);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const Store = require("electron-store");
    	const prompt = require("electron-prompt");
    	const Alert = require("electron-alert");
    	const crypto = require("crypto");

    	$$self.$capture_state = () => ({
    		Store,
    		prompt,
    		Alert,
    		crypto,
    		AccountRepository,
    		AccountCardGrid,
    		require
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app$1 = new App({
    	target: document.body,
    });

    return app$1;

}());
//# sourceMappingURL=bundle.js.map

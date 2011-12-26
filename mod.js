/*
 var m1 = Mod.module({
        name: 'm1',
        requires: ['m2', 'm3'],
        body: function(){
        }
    });
 */

(function(){
    Mod = {
        count: 0,
        loadingCount: 0,
        nocache: '',
        modules: {},
        download: [],
        prefixPath: '',
        synchronous: false,
        getClassName: function(classPath){
            var path = classPath.split('.');
            return path[path.length-1];
        },
        setNocache: function(flag){
            this.nocache = flag ? '?' + Math.random().toString().substr(2) : '';
        },
        $: function (selector) {
            return selector.charAt(0) == '#' ? document.getElementById(selector.substr(1)) : document.getElementsByTagName(selector);
        },
        apply: function(o, c, defaults){
            // no "this" reference for friendly out of scope calls
            if(defaults){
                Mod.apply(o, defaults);
            }
            if(o && c && typeof c == 'object'){
                for(var p in c){
                    o[p] = c[p];
                }
            }
            return o;
        },
        config: function(config){
            return this.apply(this, config);
        },
        define: function(classPath, config){
            var className = this.getClassName(classPath);
            var requires = [];
            var parentClassName;
            if(config.extend != undefined){
                requires = [config.extend];
                parentClassName = this.getClassName(config.extend);
            }
            
            Mod.module({
                name: className,
                requires: requires,
                body: function(){
                    var parent = window[parentClassName] || Mod.Class;
                    window[className] = parent.create(config);
                }
            });
        },
        module: function(config){
            config.loaded = false;
            this.modules[config.name] = config;
            this.download.push(config);
            this.count++;
            //TODO: подписаться на событие onReady
            this.process();
        },
        process: function(){
            var modulesLoaded = false;
            //TODO: while
            for(var i=0; i<this.download.length; ++i){
                var m = this.download[i];
                var requiresLoaded = true;
                for(var r=0; r<m.requires.length; ++r){
                    var req = m.requires[r];
                    
                    if(!this.modules[req]){
                        requiresLoaded = false;
                        this.loadScript(req, m.name);
                    }else if(!this.modules[req].loaded){
                        requiresLoaded = false;
                    }
                }
                
                if (requiresLoaded && m.body) {
                    this.download.splice(i, 1);
                    m.loaded = true;
                    m.body();
                    modulesLoaded = true;
                    i--;
            
                    this.onProgress(this.count, this.count-this.download.length);
                }
            }
            
            if(modulesLoaded){
                this.process();
            }else if (/*!ig.baked && */this.loadingCount == 0 && this.download.length != 0) {
                var unresolved = [];
                for (var i = 0; i < this.download.length; i++) {
                    unresolved.push(this.download[i].name);
                }
                throw ('Unresolved (circular?) dependencies: ' + unresolved.join(', '));
            }
        },
        onProgress: function(count, val){
            if(count<=0) return;
            var p = val*100/count;
            console.log('progress: '+Math.round(p)+'%');
        },
        loadScript: function(name, requiredFrom){
            var url = '/' + name.replace(/\./g, '/') + '.js' + this.nocache;
            this.modules[name] = {
                name: name,
                requires: [],
                loaded: false,
                body: null
            };
            
            this.loadingCount++;
            if(this.sinchronous){
                this.injectScript(url, function(){
                    this.loadingCount--;
                    this.process();
                }, function(){
                    throw ('Failed to load module ' + name + ' at ' + url + ' ' + 'required from ' + requiredFrom);
                }, this)
            }else{
                this.loadXHRScript(url, function(){
                    this.loadingCount--;
                    this.process();
                }, function(){
                    throw ('Failed to load module/class ' + name + ' at ' + url + ' ' + 'required from ' + requiredFrom);
                }, this)
            }
        },
        loadXHRScript: function(url, onLoad, onError, scope){
            var isCrossOriginRestricted = false,
                fileName = url.split('/').pop(),
                xhr, status, onScriptError;

            if (typeof XMLHttpRequest !== 'undefined') {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }

            try {
                xhr.open('GET', url, false);
                xhr.send(null);
            } catch (e) {
                isCrossOriginRestricted = true;
            }

            status = (xhr.status === 1223) ? 204 : xhr.status;

            if (!isCrossOriginRestricted) {
                isCrossOriginRestricted = (status === 0);
            }

            if (isCrossOriginRestricted
                ) {
                onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; It's likely that the file is either " +
                    "being loaded from a different domain or from the local file system whereby cross origin " +
                    "requests are not allowed due to security reasons. Use asynchronous loading with " +
                    "Ext.require instead.", this.synchronous);
            }
            else if (status >= 200 && status < 300
                ) {
                // Firebug friendly, file names are still shown even though they're eval'ed code
                new Function(xhr.responseText + "\n//@ sourceURL=" + fileName)();

                onLoad.call(scope);
            }
            else {
                onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; please " +
                    "verify that the file exists. " +
                    "XHR status code: " + status, this.synchronous);
            }

            // Prevent potential IE memory leak
            xhr = null;
            
        },
        injectScript: function(url, onLoad, onError, scope){
            var script = document.createElement('script'),
            me = this,
            onLoadFn = function() {
                me.cleanupScriptElement(script);
                onLoad.call(scope);
            },
            onErrorFn = function() {
                me.cleanupScriptElement(script);
                onError.call(scope);
            };

            script.type = 'text/javascript';
            script.src = url;
            script.onload = onLoadFn;
            script.onerror = onErrorFn;
            script.onreadystatechange = function() {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    onLoadFn();
                }
            };

            this.$('head')[0].appendChild(script);

            return script;
        },
        cleanupScriptElement: function(script){
            script.onload = null;
            script.onreadystatechange = null;
            script.onerror = null;
            return this;
        }
        
    }
    
    var initializing = false, fnTest = /xyz/.test(function(){
        xyz;
    }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    Mod.Class = function(){};
  
    // Create a new Class that inherits from this class
    Mod.Class.create = function(prop) {
        var _super = this.prototype;
    
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;
    
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && 
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
                return function() {
                    var tmp = this._super;
            
                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];
            
                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);        
                    this._super = tmp;
            
                    return ret;
                };
            })(name, prop[name]) :
            prop[name];
        }
    
        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }
    
        // Populate our constructed prototype object
        Class.prototype = prototype;
    
        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.create = arguments.callee;
    
        return Class;
    };
})();
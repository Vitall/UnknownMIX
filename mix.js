(function (){
    Mix = {
        namespace : {},
        //------------config----------
        cache: true,
        path: {},
        synchronous: false,
        
        multiextended: true,
        absrtacts: true,
        interfaces: true,
        
        debug : false,
        debugPrefix : '',
        //----------private members---------
        _count: 0,
        _loadingCount: 0,
        _modules: {},
        _download: [],
        
        //----------public functions--------
        namespace: function (namespaces){
            var ns = namespaces.split('.'),
                current = namespaces.length > 0 ? Mix.namespace[ns[0]] : Mix.namespace;

            if (current === undefined) {
                current = Mix.namespace[ns[0]] = {};
            }

            for (var i = 1; i < ns.length; ++i) {
                current = current[ns[i]] = current[ns[i]] || {};
            }
            return current;
        },
        apply: function (o, c, defaults){
            // no "this" reference for friendly out of scope calls
            if (defaults) {
                Mix.apply(o, defaults);
            }
            if (o && c && typeof c == 'object') {
                for (var p in c) {
                    o[p] = c[p];
                }
            }
            return o;
        },
        config: function (config){
            return this.apply(this, config);
        },
        log : function(){
            Mix._console('log',arguments);
        },
        info : function(){
            Mix._console('info',arguments);
        },
        warning : function(){
            Mix._console('warn',arguments);
        },
        error : function(){
            Mix._console('error',arguments);
        },
        
        _console : function(type,args){
            if(Mix.debug == true){
                var args = Array.prototype.slice.call(args);
                args.unshift(Mix.debugPrefix);
                console[type].apply(console,args);
            }
        },
        define: function (){
            var classPath = '',
                requires = [],
                config = {};
            //разбор аргументов. Если их 3 - classPath, requires, config
            //если 2 - classPath, config
            switch (arguments.length) {
                case 2:
                    classPath = arguments[0];
                    config = arguments[1];
                    break;
                case 3:
                    classPath = arguments[0];
                    requires = arguments[1] || [];
                    config = arguments[2];
                    break;
                default:
                    throw('Incorrect arguments');
            }
            Mix.info('создаётся класс '+classPath);
            var path = classPath.split('.');
            var className = path[path.length - 1];
            var classNamespace = this.namespace(path.slice(0, path.length - 1).join('.'));

            if (config.extend != undefined) {
                
                if(typeof config.extend == 'string'){
                    config.extend = [config.extend];
                }
                var pathParents = [];
                var parentsClassName = [];
                var parentsClassNamespace = [];
                for(var i in config.extend){
                    var extend = config.extend[i];
                    Mix.info('Наследуется '+ extend);
                    requires.push(extend);
                    
                     pathParents[i] = config.extend[i].split('.');
                     parentsClassName[i] = pathParents[i][pathParents[i].length - 1];
                     parentsClassNamespace[i] = this.namespace(pathParents[i].slice(0, pathParents[i].length - 1).join('.'));
                   
                }
                delete config.extend;
             }
             
             if(config.implement != undefined){
                 if(typeof config.implement == 'string'){
                    config.implement = [config.implement];
                 }
                 var faces = [];
                 for(var i in config.implement){
                    var face =  config.implement[i];
                    requires.push(face);
                     
                    faces.push(face);
                   
                 }
            }
            var  methods = [];
            if(config.abstract == true){
                if(config.methods !== undefined){
                    methods = config.methods;
                }
            }
            
            Mix.module({
                name: classPath,
                requires: requires,
                body: function (){
                    var parents = {},
                    newClass = Mix.Class.create(config);
                        
                       
                       for(var i in parentsClassNamespace){
                            if(parentsClassNamespace.length > 1 && Mix.multiextended == false){
                                Mix.error("Множественное наследование отключено , попытка унаследовать несколько классов - " +classPath);
                                return false;
                            }
                            parents[i] = parentsClassNamespace[i] && parentsClassNamespace[i][parentsClassName[i]] || Mix.Class;
                            if(parents[i].prototype.implement !== undefined){
                                 faces = faces.concat(parents[i].prototype.implement);
                            }
                            if(parents[i].prototype.abstract == true && parents[i].prototype.methods !== undefined ){
                                 methods = methods.concat(parents[i].prototype.methods);
                                 
                            }
                            var tmp = newClass.prototype;
                            newClass =   parents[i].create(); // config , need time-testing
                            newClass.prototype =  Mix.apply(newClass.prototype,tmp);
                        } 
                        
                        
                        
                        if(config.abstract == undefined){
                            newClass.prototype.abstract = false;
                        }
                        
                        
                        
                       
                    //добавляю статические функции
                    for (var f in config) {
                        if (!config.hasOwnProperty(f)) continue;
                        if (/static_/.test(f)) {
                            var funcName = f.substring(7);
                            newClass[funcName] = config[f];
                        }
                    }  
                    if(config.abstract !== true){
                       
                     if(Mix.interfaces == true) {  
                     for(var i in faces){ 
                            face = Mix.namespace(faces[i]);
                            face = face.prototype;
                            if(face.methods !== undefined){
                                for(var j in face.methods){ 
                                    if(newClass.prototype[face.methods[j]] == undefined ){
                                     
                         
                                       Mix.error('Метод - '+face.methods[j] + ' , объявленный в интерфейсе - '+ faces[i] + ', не реализован в классе: ' +classPath);
                                        return false;
                                    }
                                }
                            }
                     }
                     for(var i in methods){
                        if(newClass.prototype[methods[i]] == undefined){
                            Mix.error('Абстрактный метод - ' + methods[i] + ', не реализован в классе: ' + classPath);
                            return false;
                        }
                     }
                    } 
                    }else{
                       Mix.info('Абстрактный класс наследует абстрактные методы : ' + methods); newClass.prototype.methods = methods;
                       Mix.info('Абстрактный класс наследует интерфейсы : ' + faces); newClass.prototype.implement = faces;
                    }
                    
                    
                    classNamespace[className] = newClass;
                }
            });
        },
        module: function (config){
            config.loaded = false;
            this._modules[config.name] = config;
            this._download.push(config);
            this._count++;
            //TODO: подписаться на событие onReady
            this.process();
        },
        process: function (){
            var modulesLoaded = false;
            for (var i = 0; i < this._download.length; ++i) {
                var m = this._download[i];
                m.requires = m.requires || [];
                var requiresLoaded = true;
                for (var r = 0; r < m.requires.length; ++r) {
                    var req = m.requires[r],
                        parts = req.split(':'),
                        prefix = '';

                    if (parts.length == 2) {
                        prefix = parts[0];
                        req = parts[1];
                    } else if (parts.length == 0 || parts.length > 2) {
                        throw('Incorrect name: ' + req);
                    }


                    if (!this._modules[req]) {
                        requiresLoaded = false;
                        this.loadScript(req, m.name, prefix);
                    } else if (!this._modules[req].loaded) {
                        requiresLoaded = false;
                    }
                }

                if (requiresLoaded && m.body) {
                    this._download.splice(i, 1);
                    m.loaded = true;
                    m.body();
                    modulesLoaded = true;
                    i--;

                    this.onProgress(this._count, this._count - this._download.length);
                }
            }

            if (modulesLoaded) {
                this.process();
            } else if (this._loadingCount == 0 && this._download.length != 0) {
                var unresolved = [];
                for (i = 0; i < this._download.length; i++) {
                    unresolved.push(this._download[i].name);
                }
               // Mix.log('Unresolved (circular?) dependencies: ' + unresolved.join(', '));
            }
        },
        onProgress: function (count, val){
            if (count <= 0) return;
            var p = val * 100 / count;
            //Mix.log('progress: ' + Math.round(p) + '%');//debug
        },
        loadScript: function (name, requiredFrom, pathName){
            var prefix = '';
            if (pathName) {
                if (!(prefix = this.path[pathName])) throw('Undefined path: ' + pathName);
                prefix += prefix.indexOf(prefix.length - 1) == '/' ? '' : '/';
            }
            var url = prefix + name.replace(/\./g, '/') + '.js' + ( ( ! this.cache ) ? '?nocache=' + new Date().getTime() : '');
            this._modules[name] = {
                name: name,
                requires: [],
                loaded: false,
                body: null
            };

            this._loadingCount++;
            if (this.synchronous) {
                this.injectScript(url, function (){
                    this._loadingCount--;
                    this.process();
                }, function (){
                    throw ('Failed to load module ' + name + ' at ' + url + ' ' + 'required from ' + requiredFrom);
                }, this)
            } else {
                this.loadXHRScript(url, function (){
                    this._loadingCount--;
                    this.process();
                }, function (){
                    throw ('Failed to load module/class ' + name + ' at ' + url + ' ' + 'required from ' + requiredFrom);
                }, this)
            }
        },
        loadStyle : function(name){
           
            var url = name.replace(/\./g, '/') + '.css';
            var element = document.createElement('link');
                element.type = 'text/css';
                element.rel = 'stylesheet';
                element.href = url;
             Mix.info('загрузка стиля по url: ' + url);
             document.getElementsByTagName('head')[0].appendChild(element);
             
        },
        loadXHRScript: function (url, onLoad, onError, scope){
            var isCrossOriginRestricted = false,
                fileName = url.split('/').pop(),
                xhr, status;

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
        injectScript: function (url, onLoad, onError, scope){
            var script = document.createElement('script'),
                me = this,
                onLoadFn = function (){
                    me.cleanupScriptElement(script);
                    onLoad.call(scope);
                },
                onErrorFn = function (){
                    me.cleanupScriptElement(script);
                    onError.call(scope);
                };

            script.type = 'text/javascript';
            script.src = url;
            script.onload = onLoadFn;
            script.onerror = onErrorFn;
            script.onreadystatechange = function (){
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    onLoadFn();
                }
            };

            document.getElementsByTagName('head')[0].appendChild(script);
            return script;
        },
        cleanupScriptElement: function (script){
            script.onload = null;
            script.onreadystatechange = null;
            script.onerror = null;
            return this;
        },
        obj : function(){
            var args = Array.prototype.slice.call(arguments);
            var namespace = args.shift();
            Mix.log('Создаётся объект класса ' + namespace);
            this.autoload(namespace);
            var clas = Mix.namespace(namespace); 
            if(clas.prototype.abstract == true && Mix.absrtacts == true){
                Mix.error('Попытка создания объекта абстрактного класса ' + namespace);
                return false;
            }
            Mix.log('Завершение создания объекта класса ' + namespace);
            return new clas(args);   
        },
        
        isFace : function(obj,interfaces){
           if(typeof interfaces == 'string'){
                interfaces = [interfaces];
           }
           
           Mix.autoload(interfaces);
         
           for(var i in interfaces){
               var face = Mix.namespace(interfaces[i]);
               for(var j in face.prototype.methods){
                   if(obj[face.prototype.methods[j]] == undefined){
                       return false;
                   }
               }
           }
           return true;
        },
        
        autoload : function(requires){
            if(typeof requires == 'string'){
                requires = [requires];
            }
            for(var i in requires){
                Mix.info('Запрос на динамическую загрузку: ' + requires[i]);
            }
            Mix.config({synchronous: false,  cache: true}).module({requires: requires});
            for(var i in requires){
                Mix.info('Завершение динамической загрузки: ' + requires[i]);
            }
        }

    };

    var initializing = false, fnTest = /xyz/.test(function (){
   
    }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    Mix.Class = function (){
    };

    // Create a new Class that inherits from this class
    Mix.Class.create = function (prop){
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
                (function (name, fn){
                    return function (){
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
        function Class(args){
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, args);
        }

        // Populate our constructed prototype object
        Class.prototype = Mix.apply(Class.prototype,prototype);

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.create = arguments.callee;

        return Class;
    };
    
    
    
/*cross browser solutions*/
// .bind(context)
    Function.prototype.bind = function (scope){
        var _function = this;

        return function (){
            return _function.apply(scope, arguments);
        }
    }

})();



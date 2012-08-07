Mix.module({requires: ['libs.history']});
Mix.define('base.mvc.Router', {
  //Корневой путь роутинга
   root : '',
   //Роутеры в которых хранятся регулярные выражение и имя события
   routers: [],
   //события после изменения урл
   events: {},
   //слушатели  событий роутера
   callbacks: {},
   
   
   init:function (root) {
     this.root = root;
     this._listenBrowser();
    
   },
   
   //Добавляет события и правила роутинга
   addRules : function(rules){
     this.events = rules.events;  
     for(var index in rules.routing ){
         var router ={};
         router['reg'] = this._routeToRegExp(index);
         router['event'] = rules.routing[index];
         this.routers.push(router);
     } 
     
   },
   
   //Функция перехода 
   go: function(url){
       history.pushState(null,null,this.root + url);
       this._routing(url);
   },
   //Добавляет callback для какого-либо события роутера
   addCallback : function(event,id,callback){
       if(this.callbacks[event] === undefined){
           this.callbacks[event] = {};
       }
       this.callbacks[event][id] = callback;
       
   },
   
   //TODO 
   removeCallback : function(event,id){
       
   },
   
   //TODO прослушивает события навигации браузера
   _listenBrowser : function(){
   /*  $(window).bind( "popstate",function(e){
        console.log(e);
     }.bind(this));
     
     $( window ).bind( "pushstate",function(e){
        //this.fire('forward',e);
     }.bind(this));  */
   },
   
   //Вызывает события и их слушателей 
   _routing : function(url){
      for(var index in this.routers){
          if(url.match(this.routers[index]['reg'])){
              this.events[this.routers[index]['event']](url);
              for(var id in this.callbacks[this.routers[index]['event']] ){
                  this.callbacks[this.routers[index]['event']][id](url);
              }
              return true;
          }
      }
      
   },
   
   //Backbone(c)
   _routeToRegExp: function(url) {
      url = url.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
                   .replace(/:\w+/g, '([^\/]+)')
                   .replace(/\*\w+/g, '(.*?)');
      return new RegExp('^' + url + '$');
    }
   

}); 
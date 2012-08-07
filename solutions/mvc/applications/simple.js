

Mix.define('applications.Simple', {
    
    router : false,
    layouts : false, 
    events : false,
    
    init:function () {
        
     var routerName = 'Router';
     
     Mix.module({requires: ['base.mvc.'+routerName]});
     this.router = new Mix.base.mvc[routerName]('http://localhost/UMix/solutions/mvc');
     this._setRouter();
   
     $(window).keypress( function(){ this.router.go('/go')}.bind(this)  );
     
        
    },
    
    _setRouter : function(){
        this.router.addRules({
         events : {
             "goEvent" : function(){
                 alert('And we go');
             }
         },
         
         routing : {
             "/go" : "goEvent"
         }
         
     });
    }

}); 
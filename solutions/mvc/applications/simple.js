Mix.define('applications.Simple', {
    
    
    router : false,
    
    init:function () {
     
     var routerName = 'Router';
     this.router = Mix.obj('base.browser.'+routerName , 'http://localhost/UMix/solutions/mvc');
     this._setRouter();
   
   
     $(window).keypress( function(){this.router.go('/go')}.bind(this)  );
     
        
    },
    
    _setRouter : function(){
        
        this.router.addRules({
            
         events : {
             "goEvent" : function(){
                 alert('And we go');
             }
         },
         /* Rule : event */
         routing : {
             "/go" : "goEvent"
         }
         
     });
    }

}); 
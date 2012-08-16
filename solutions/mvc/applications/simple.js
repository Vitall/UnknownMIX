Mix.define('applications.Simple', {
    
    
    router : false,
    extend : ['applications.PartX','applications.PartY'],
    implement : ['applications.ISimple'],
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
    },
    
    sayX : function (){
        alert('Hello X');
    },
    sayY : function (){
        alert('Hello Y');
    },
    sayZ : function (){
        alert('Hello Z');
    },
    saySimple : function(){
        alert('Hello Simple');
    },
    sayClass2 : function(){
        alert('Hello Class2');
    },
    
    sayClass : function(){
        alert('FUCK YOU ALL');
    }

}); 
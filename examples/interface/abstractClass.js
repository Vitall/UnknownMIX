Mix.define('abstractClass', {
    
    abstract : true,
    implement : ['faces.IForAbstract'],
    
    methods: [
        'hello'
    ],
    
    init:function () {
      
    },
    
    say : function(){
        alert("Say");
        this.hello();
    },
   

}); 
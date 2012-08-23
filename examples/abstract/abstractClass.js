Mix.define('abstractClass', {
    
    abstract : true,
    
    methods: [
        'hello'
    ],
    
    init:function () {
      
    },
    
    say : function(){
        alert("Say");
        this.hello();
    }

}); 
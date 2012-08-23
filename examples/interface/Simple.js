Mix.define('Simple', {
    
    extend : 'abstractClass',
    implement : ['faces.IForSimple'],
    
    text : '...',
    
    hello : function(){   
       alert('Hello');
    },
    
    face1 : function(text){
        this.text = text;
    },
    
    face2 : function(){
        alert(this.text);
    }

}); 
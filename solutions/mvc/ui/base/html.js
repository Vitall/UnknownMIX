Mix.define('ui.base.Html', {
    
    el : '',
    
    init:function (el) {
        if(el !== undefined){
            this.el = el;
        }
    }, 
    
    render : function(){
        alert('Стандартный рендер');
    }
    
    
}); 
Mix.define('tests.UnitJS', {
    results : {},
    
    console : false,
    activeTestName : '',
    
    
    init : function(){
    },
    
    assert : function(a,b,message){
        if(message == undefined){
            message = '';
        }else{
            message = 'Message : ' + message;
        }
        message = 'Test : ' + this.activeTestName + ' <br>  ' + message;
        this.showResult(a==b,message,a,b);
    },
    
    assertTrue : function(a,message){
        this.assert(a,true,message);
    },
    
    assertType :function(a,type,message){
        if(message == undefined){
            message = '';
        }else{
            message = 'Message : ' + message;
        }
        message = 'Test : ' + this.activeTestName + ' <br>  ' + message;
        this.showResult(typeof a == type,message,typeof a,type);
    },
    
    //TODO Templater
    showResult : function(status,message,a,b){
        this.results['_'+status] += 1;
        this.console.append("<div class='xunit_result_"+ status +"' ><div class='xunit_message'>"+message+"</div> <div class='xunit_vars'><div = class='xunit_var1'>"+a+"</div><div = class='xunit_var2'>"+b+"</div></div> </div> ");
    },
    
    showEnd : function(){
        var status = true;
        if(this.results._false > 0){
            var status = false;
        }
        var progress =100 - this.results._false/(this.results._false + this.results._true)*100;
        progress = progress.toFixed();
        this.console.append("<div class='xunit_end_"+status+"'><h2>Итоги теста: </h2><div class='xunit_end_count'><div class='xunit_end_trues'>True : "+ this.results._true+"</div><div class='xunit_end_falses'>False : "+ this.results._false+"</div><div class='xunit_end_progress'>Progress : "+ progress +"%</div></div></div>");
    },
    
    start : function(){
      this.results._true = 0;
      this.results._false = 0;
      
       var i = 0;
       for(i in this){
          if(i.substr(0,4) == 'test'){
              this.activeTestName = i.substr(4);
              this[i]();
          }
       }
       this.showEnd();
    },
    
    setConsole : function(consoleId){
         Mix.loadStyle('styles.unitjs');
         this.console = $('#'+consoleId);
         
         this.console.addClass('xunit_console');
    }
    
});   
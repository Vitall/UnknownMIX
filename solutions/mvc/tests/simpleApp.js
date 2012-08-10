Mix.define('tests.SimpleApp', {
        extend : ['tests.UnitJS'],
        
        init : function(){
            
        },
          //Simple examples
        testSimple : function(){
          
            this.assertType('Hello World','string','Тестовая проверка ,должна быть зелёной ');
            this.assertType(1241,'integer','Тестовая проверка,должна быть красной ');
            
            //this.assert(1244,'sdfsdklc','Провальный тест');
            
        },
        //Real Class
        testReal : function(){
            
            var obj = Mix.obj('applications.Simple');
            this.assertTrue(obj.isApplication(),'Тестовая проверка ');
        }
        
});


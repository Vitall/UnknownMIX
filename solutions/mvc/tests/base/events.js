 Mix.define('tests.base.Events', {
        extend : ['tests.UnitJS'],
        
        setUp : function(){
            this.setFixture( Mix.obj('base.Events') );
            this.callbackCount = 0;
            this.callbackOne = function(){this.callbackCount += 1};
            this.callbackTwo = function(){this.callbackCount += 2};
            this.fixture.on(this.callbackOne.bind(this),['testEvent'],'one');
            this.fixture.on(this.callbackTwo.bind(this),'testEvent');
           
            this.setEventParam = function(param){this.eventParam = param};
            this.eventParam = '';
        },
        
        testOn: function(){
           this.assertTrue(this.fixture.EventSubscribers['testEvent'] !== undefined,'существование события после подписки на него')
        
           this.assertType(this.fixture.EventSubscribers['testEvent']['one'] , 'function' , 'существование подписчиков'); 
           this.assertType(this.fixture.EventSubscribers['testEvent'][0] , 'function' , 'существование подписчиков 2'); 
       
        },
        
        testTrigger : function(){
            this.fixture.trigger('testEvent');
            this.assert(this.callbackCount , 3 , 'Проверка callbacks после события');
            
            this.fixture.on(this.setEventParam.bind(this),'eventParam');
            this.fixture.trigger('eventParam','testEventParam');
            this.assert(this.eventParam , 'testEventParam' , 'Проверка callbacks после события');
        },
        
        testOff : function(){
            
            this.fixture.off('one');
            this.assertTrue(this.fixture.EventSubscribers['testEvent']['one'] == undefined,'отсутстиве обработчика ,после удаления')
            this.assertTrue(this.fixture.EventSubscribers['testEvent'][0] != undefined,'Второй обработчик остался')
            this.fixture.trigger('testEvent');
            this.assert(this.callbackCount , 5 , 'Проверка callbacks после удаления одного из них');
        }
});



 
 


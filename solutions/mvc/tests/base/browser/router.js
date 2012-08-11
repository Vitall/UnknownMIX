 Mix.define('tests.base.browser.Router', {
        extend : ['tests.UnitJS'],
        
        setUp : function(){
            this.setFixture( Mix.obj('base.browser.Router','test.com') );
        },
        
        testRules: function(){
            this.assert(this.fixture.root,'test.com','Корневой путь роутера');
            
            this.fixture.addRules({

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
            
            this.assertType(this.fixture.events.goEvent,'function','События - функции');
            this.assertType(this.fixture.routers[0],'object','Проверка существования роутеров');
            this.assert(this.fixture.routers[0].event,'goEvent','Проверка единственного роутера ,который мы добавили');
           
        }
});



 
 


Mix.define('tests.applications.Simple', {
        extend : ['tests.UnitJS'],
        
        setUp: function(){
            this.setFixture(Mix.obj('applications.Simple'));
        },
        
        testProperty: function(){
            this.assertType(this.fixture.router,'object','Проверка существования роутера');
        }
        
});



Mix.define('base.Events', {
    EventSubscribers: {},
    
    on: function (subscriber, events , id){
        if(typeof events == 'string'){
            events = [events];
        }
        for (var i in events) {
            if (this.EventSubscribers[events[i]] === undefined) {
                this.EventSubscribers[events[i]] = [];
            }
            if(id !== undefined){
                this.EventSubscribers[events[i]][id] = subscriber;
            }else{
                this.EventSubscribers[events[i]].push(subscriber);
            }
            
        }
        return this;
    },
     
    off: function (subscriber,events){
        //by id
        if(typeof subscriber == 'string'){
            if(events === undefined){
                for (var i in this.EventSubscribers) {
                    if(this.EventSubscribers[i][subscriber] !== undefined){
                        delete this.EventSubscribers[i][subscriber];
                    }
                } 
            }else{
               
                if(typeof events == 'string'){
                    events = [events];
                }
                for (var i in events) {
                    if(this.EventSubscribers[events[i]][subscriber] !== undefined){
                        delete this.EventSubscribers[events[i]][subscriber];
                    }
                } 
            }    
        }     
        
        return this;
        
    },
    
    clearSubscribers: function (){
        this.EventSubscribers = {};
        return this;
    },
    
    trigger: function (){
        var args = Array.prototype.slice.call(arguments);
        var event = args.shift();
        var subscribers = this.EventSubscribers[event]; 
        for (var i in subscribers) {
            subscribers[i].apply(null,args);
        }
        return this;
    }
});
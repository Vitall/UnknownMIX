Mix.define('base.Event', {
    EventSubscribers: {},
    Events : [],
    on: function (subscriber, events){
        for (var i in events) {
            if (!this.subscribers[events[i]]) {
                this.subscribers[events[i]] = [];
            }
            this.subscribers[events[i]].push(subscriber);
        }
        return this;
    },
     
    off: function (subscriber){
        for (var i in this.subscribers) {
            for (var j in this.subscribers[i]) {
                if (this.subscribers[i][j] === subscriber) {
                    this.subscribers[i].splice(j, 1);
                }
            }
        }
        return this;
    },
    
    clearSubscribers: function (){
        this.subscribers = {};
        return this;
    },
    
    trigger: function (){
        var args = Array.prototype.slice.call(arguments);
        var event = args.shift();
        var subscribers = this.subscribers[event]; 
        for (var i in subscribers) {
            subscribers[i].apply(null,args);
        }
        return this;
    }
});
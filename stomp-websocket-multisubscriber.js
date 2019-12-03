
/**
 * stomp-websocket-multi-subscriber
 * https://github.com/euledge/stomp-websocket-multi-subscriber
 *
 * author     Hitoshi Kuroyanagi (@euledge)
 * copyright (c) 2016 Hitoshi Kuroyanagi
 *
 * require
 *  - https://github.com/sockjs/sockjs-client
 *  - https://github.com/jmesnil/stomp-websocket
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

function StompWebsocket() {
  this.stompClient
  this.connectHandler
  this.disconnectHandler
  this.closeHandler
  this.errorHandler
  this.debug = false
  this.subscribers = [];
}

// register function on connect
StompWebsocket.prototype.setConnectHandler = function(func) {
  this.connectHandler = func

}

// unregister function on connect
StompWebsocket.prototype.removeConnectHandler = function() {
  delete this.connectHandler
}

// register function on disconnect
StompWebsocket.prototype.setDisconnectHandler = function(func) {
  this.disconnectHandler = func
}

//register function on close
StompWebsocket.prototype.setCloseHandler = function(func) {
  this.closeHandler = func
}

//unregister function on close
StompWebsocket.prototype.removeCloseHandler = function() {
  delete this.closeHandler
}

//register function on error
StompWebsocket.prototype.setErrorHandler = function(func) {
  this.errorHandler = func
}

//unregister function on error
StompWebsocket.prototype.removeErrorHandler = function() {
  delete this.errorHandler
}

// unregister function on disconnect
StompWebsocket.prototype.removeDisconnectHandler = function() {
  delete this.disconnectHandler
}

// Disable debug message
StompWebsocket.prototype.setDebugOn = function() {
  this.debug = true
}

StompWebsocket.prototype.connect = function(endpoint, topic) {
  const socket = new SockJS(endpoint);
  this.stompClient = Stomp.over(socket);
  if (!this.debug) {
    this.stompClient.debug = function(func) {}
  }
  this.stompClient.connect({}, (function(frame) {
    if (this.connectHandler) {
      this.connectHandler()
    }
    this.stompClient.subscribe(topic, this.trigger.bind(this));
  }).bind(this));

  socket.onerror = function(e) {
    if (stomp.errorHandler) {
      stomp.errorHandler(e)
    }
    console.error(e);
  }
  const stomp = this;
  socket.onclose = function() {
    if (stomp.closeHandler) {
      stomp.closeHandler()
    }
  }
}

StompWebsocket.prototype.disconnect = function() {
  if (this.stompClient != null) {
    this.stompClient.disconnect();

  }
  if (this.disconnectHandler) {
    this.disconnectHandler()
  }
}

StompWebsocket.prototype.send = function(endpoint, data) {
  this.stompClient.send(endpoint, {}, data);
}

// name use key on removeSubscriber, sleepSubscriber, activeSubscriber
StompWebsocket.prototype.addSubscriber = function(name, func) {
  var obj = {
    name: name,
    active: true,
    func: func
  }
  this.subscribers.push(obj)
}

StompWebsocket.prototype.removeSubscriber = function(name) {
  for (var i = 0; i <  this.subscribers.length; i++) {
    var subscriber = this.subscribers[i];
    if (subscriber['name'] === name) {
      if (this.debug) {
        console.log("removeSubscriber " + name);
      }
      this.subscribers.splice(i, 1);
    }
  }
}

StompWebsocket.prototype.sleepSubscriber = function(name) {
  var l = this.subscribers.length;
  for (var i = 0; i < l; i++) {
    var subscriber = this.subscribers[i];
    if (subscriber['name'] === name) {
      if (this.debug) {
        console.log("sleepSubscriber " + name);
      }

      subscriber['active'] = false;
    }
  }
}

StompWebsocket.prototype.activeSubscriber = function(name) {
  var l = this.subscribers.length;
  for (var i = 0; i < l; i++) {
    var subscriber = this.subscribers[i];
    if (subscriber['name'] === name) {
      if (this.debug) {
        console.log("activeSubscriber " + name);
      }
      subscriber['active'] = true;
    }
  }
}

// execute subscriber with active state
StompWebsocket.prototype.trigger = function(event) {
  for (var i = 0; i < this.subscribers.length; i++) {
    if (this.subscribers[i]['active'] && event.headers.destination === this.subscribers[i]['name']) {
      var subscriber = this.subscribers[i]['func'];
      subscriber(event.body);
    }
  }
}

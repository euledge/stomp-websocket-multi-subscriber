
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
  this.connectHandler;
  this.disconnectHandler;
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

// unregister function on disconnect
StompWebsocket.prototype.removeDisconnectHandler = function() {
  delete this.disconnectHandler
}

StompWebsocket.prototype.connect = function(endpoint, topic) {
  var socket = new SockJS(endpoint);
  this.stompClient = Stomp.over(socket);
  this.stompClient.connect({}, (function(frame) {
    if (this.connectHandler) {
      this.connectHandler()
    }
    console.log('Connected: ' + frame);
    this.stompClient.subscribe(topic, this.trigger.bind(this));
  }).bind(this));
}

StompWebsocket.prototype.disconnect = function() {
  if (this.stompClient != null) {
    this.stompClient.disconnect();
  }
  if (this.disconnectHandler) {
    this.disconnectHandler()
  }
  console.log("Disconnected");
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
  var l = this.subscribers.length;
  for (var i = 0; i < l; i++) {
    var subscriber = this.subscribers[i];
    if (subscriber['name'] === name) {
      this.subscribers.splice(i, 1);
    }
  }
}

StompWebsocket.prototype.sleepSubscriber = function(name) {
  var l = this.subscribers.length;
  for (var i = 0; i < l; i++) {
    var subscriber = this.subscribers[i];
    if (subscriber['name'] === name) {
      subscriber['active'] = false;
    }
  }
}

StompWebsocket.prototype.activeSubscriber = function(name) {
  var l = this.subscribers.length;
  for (var i = 0; i < l; i++) {
    var subscriber = this.subscribers[i];
    if (subscriber['name'] === name) {
      subscriber['active'] = true;
    }
  }
}

// execute subscriber with active state
StompWebsocket.prototype.trigger = function(event) {
  var l = this.subscribers.length;
  for (var i = 0; i < l; i++) {
    if (this.subscribers[i]['active']) {
      var subscriber = this.subscribers[i]['func'];
      subscriber(event.body);
    }
  }
}
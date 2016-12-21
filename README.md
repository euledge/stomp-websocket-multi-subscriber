# stomp-websocket-multi-subscriber
Stomp on WebSocket client  and resist multi subscriber

# require

- https://github.com/sockjs/sockjs-client
- https://github.com/jmesnil/stomp-websocket

# Sample

``` javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.1/sockjs.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>

<script>
var stompWebsocket = new StompWebsocket()

stompWebsocket.setConnectHandler(function(){console.log("Connect Client!!")})
stompWebsocket.setDisconnectHandler(function(){console.log("Disconnect Client!!")})

stompWebsocket.connect('/websocket', '/topic')
// print Connect Client!! when connected.

var hello = function(data) {
  console.log("hello stompClient")
}
stompWebsocket.addSubscriber('Hello', hello)
// print Hello stompClient when received topic.

var goodNight = function(data) {
  console.log("good night stompClient")
}
stompWebsocket.addSubscriber('GoodNight', goodNight)
// print Hello stompClient and Good night stompClient when received topic].

stompWebsocket.sleepSubscriber('Hello')
// print Good night stompClient when received topic.

stompWebsocket.removeSubscriber('GoodNight')
// print nothing when received topic.

stompWebsocket.activeSubscriber('Hello')
// print hello stompClient when received topic.

setTimeout(function(){stompWebsocket.disconnect()}, 10000);
// print Disconnect Client!! when disconnected.
</script>
```

# Authors
 * [Hitoshi Kuroyanagi](https://github.com/euledge)
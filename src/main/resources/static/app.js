var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.fill();
    };
    
    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
    
        // subscribe to /topic/newpoint when connection succeeds
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                // extract coordinates from event
                var body = eventbody.body;
                var eventJSON = JSON.parse(body);
                var x = eventJSON.x;
                var y = eventJSON.y;
    
                addPointToCanvas(new Point(x, y));
            });
        });
    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            can.addEventListener("mousedown", function(event) {
                // Obtener coordenadas x e y del evento
                var rect = can.getBoundingClientRect();
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;
        
                // Publicar punto en el servidor
                app.publishPoint(x, y);
            });

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();
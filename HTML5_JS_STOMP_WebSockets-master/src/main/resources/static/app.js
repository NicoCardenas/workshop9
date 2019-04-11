var app = (function () {    

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var sala = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    var addPolygonToCanvas = function (eventbody){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var polygon=JSON.parse(eventbody.body);
        ctx.fillStyle = '#2629ff';
        ctx.beginPath();
        ctx.moveTo(polygon[0].x,polygon[0].y);
        for (var i=1;i<polygon.length;i++) {
            ctx.lineTo(polygon[i].x,polygon[i].y);
        }
        ctx.closePath();
        ctx.fill();
    };   
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {        
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);           
            stompClient.subscribe("/topic/newpoint." + sala, onMessage);
            stompClient.subscribe('/topic/newpolygon.' + sala, addPolygonToCanvas);
        });
    };
    
    var onMessage = function (greeting) {
        var newpoint = JSON.parse(greeting.body); 
        addPointToCanvas(newpoint);
        //alert(greeting);
    }

    var listenerMouse = function () {
        var can = document.getElementById("canvas");
        can.addEventListener('click', function(event){
            var pt = getMousePosition(event);
            addPointToCanvas(pt);                
            stompClient.send("/app/newpoint." + sala, {}, JSON.stringify(pt));
        });
    };

    return {

        init: function (val) {            
            sala = val;
            listenerMouse();
            document.getElementById('canvas').style.visibility = "visible";
            document.getElementById('pos').style.visibility = "visible";
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            //enviando un objeto creado a partir de una clase
            stompClient.send("/app/newpoint."+sala, {}, JSON.stringify(pt));
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
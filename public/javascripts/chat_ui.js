function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}
function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;
    if (message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    } else {

//      var toLat=37.40365;
//      var toLon=-122.146067;
        if ($('#room').text() != "Lobby") {
            var position = chatApp.getPosition($('#room').text());
            var positions = position.split(':');
            getLocation();
            if (lat1 != 0 && position[0] != 0) {
                calculateDistances(lat1, lon1, positions[0], positions[1]);
                message = locationInfo;

                chatApp.sendMessage($('#room').text(), message);

                //Handle list of user distances
                $('#messages').append(divEscapedContentElement(message));
                $('#messages').scrollTop($('#messages').prop('scrollHeight'));
            }
        }
    }
    $('#send-message').val('');
}


var socket = io.connect();
$(document).ready(function() {
    var chatApp = new Chat(socket);
    socket.on('nameResult', function(result) {
        var message;
        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });
    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });
    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });
    socket.on('rooms', function(rooms) {
        $('#room-list').empty();
        for(var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-button').click();
        });
    });
    setInterval(function() {
        socket.emit('rooms');
    }, 1000);
    $('#send-message').focus();
    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });
});


var x;
var lat1;
var lon1;
function getLocation()
{
    x=document.getElementById("info");
    if (navigator.geolocation)
    {
     return  navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
    else{return "Geolocation is not supported by this browser.";}
}

function showPosition(position)
{
    lat=position.coords.latitude;
    lon=position.coords.longitude;
    lat1=lat;
    lon1=lon;
    return "Latitude: "+lat+"<br>Longitude: "+lon;
}

function showError(error)
{
    switch(error.code)
    {
        case error.PERMISSION_DENIED:
            x.innerHTML="User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML="Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML="The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML="An unknown error occurred."
            break;
    }
}


var locationInfo;
function calculateDistances(fromLat,fromLon,toLat,toLon) {
    var origin1 = new google.maps.LatLng(fromLat, fromLon);
    var destinationA = new google.maps.LatLng(toLat, toLon);

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [origin1],
            destinations: [destinationA],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, callback);
}

function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
        alert('Error was: ' + status);
    } else {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {

                if(results[j] != null && results[j].distance != null){
                locationInfo = results[j].distance.text + ' in '
                    + results[j].duration.text ;
                 }
            }
        }
    }
}


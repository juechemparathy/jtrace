var Chat = function(socket) {
    this.socket = socket;
};


Chat.prototype.sendMessage = function(room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', {
        newRoom: room
    });
};

Chat.prototype.getPosition = function(room){
    if(roomMap[room]=="undefined:undefined"){
        getCoordinates(room);
        if(latitude!=0){
            roomMap[room]=latitude+':'+longitude;
        }
    }
    return roomMap[room];
}

var roomMap = new Object();
Chat.prototype.processCommand = function(command) {
    var words = command.split(' ');
    var command = words[0]
        .substring(1, words[0].length)
        .toLowerCase();
    var message = false;
    switch(command) {
        case 'join':
            words.shift();
            var room = words.join(' ');

            getCoordinates(room);
            if(latitude!=0){
                roomMap[room]=latitude+':'+longitude;
                this.changeRoom(room);
            }
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unrecognized command.';
            break;
    }
    return message;
};


var geocoder = new google.maps.Geocoder();
var latitude;
var longitude;
function getCoordinates(address) {
geocoder.geocode( { 'address': address}, function(results, status) {

    if (status == google.maps.GeocoderStatus.OK) {
         latitude = results[0].geometry.location.lat();
         longitude = results[0].geometry.location.lng();
//        alert(results[0].geometry.location.lat() + ' : '+results[0].geometry.location.lng())
    } else{
        latitude=0;
        longitude=0;
        alert('Geocode was not successful for the following reason: ' + status);
    }
});
}

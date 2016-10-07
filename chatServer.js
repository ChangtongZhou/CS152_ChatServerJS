/**
 * Created by Nicole_Zhou on 10/3/16.
 */

// Load the TCP library
var net = require('net');
var eol = require('os').EOL;

var srvr = net.createServer();
var clientList = [];

srvr.on('connection', function(client) {
    // Identify this client
    client.name = client.remoteAddress + ':' + client.remotePort;

    // Send a nice welcome message and announce
    client.write('Welcome, ' + client.name + eol);

    // Put this new client in the list
    clientList.push(client);

    client.on('data', function(data) {

        var newname = data.toString().match(/\\rename <([^(?!\s*$).+]+)>/);

        if (data.toString().substring(0, ("\\list").length) == "\\list")
        {
            list(client);
        }
        else if (newname)
        {
            // regex returns newname as an array, newname[1] returns the value of newname. e.g. "nicole"
            rename(newname[1], client);
        }
        else if (data.toString().substring(0, ("\\private").length) == "\\private")
        {
            private(data.toString().substring(9),client);
        }
        else
        {
            broadcast(data, client);
        }


    });
});

// Send a message to all clients
function broadcast(data, client) {
    for (var i in clientList) {
        // Don't send it to sender
        if (client !== clientList[i]) {
            clientList[i].write(client.name + " says " + data);
        }
    }
}

function list(client){
    for (var i in clientList){
        if (client !== clientList[i]){
            client.write("These are names " + clientList[i].name + "\n");
        }
    }
}

function rename (newname, client){
    for (var i in clientList){
        if (client === clientList[i]){
            client.name = newname;
            client.write("You changed name to: " + client.name + eol)
        }
    }
}

function private (data, client){
    for (var i in clientList){
        if (data.substr(0, data.indexOf(' ')) === clientList[i].name){
            clientList[i].write(client.name + " wrote you a private message: " + data.substr(data.indexOf(' ') + 1));
        }
    }
}

srvr.listen(9000);


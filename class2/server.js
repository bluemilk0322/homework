const net = require('net');
const fs = require('fs');

const HOST = '127.0.0.1';
const PORT = 6969;

let counter = 0;

net.createServer(function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sock.on('data', function(data) {
        counter++;
        console.log('DATA ' + sock.remoteAddress + ': ' + counter + 'times.');
        let out_filename = "./output" + counter + ".txt";

        fs.open(out_filename, 'w+', (err, fd) =>{
            if (err) {
                return console.error(err);
            }
            console.log("File:" + out_filename + "created successfully!");
        });
        fs.writeFile(out_filename, data , (err) =>{
            if (err) {
                return console.error(err);
            }
            console.log("Data written successfully to file: "+ out_filename);
        });
        sock.write('Server echoed: "' + data + '"');
    });
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
}).listen(PORT, HOST);
console.log('Server listening on ' + HOST +':'+ PORT);

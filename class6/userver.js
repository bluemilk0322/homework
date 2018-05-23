const dgram = require('dgram');
const Promise = require('bluebird');
const fs = require('fs');

var PORT = 33333;
var HOST = '127.0.0.1';
const outputFilename = 'output.txt';
Promise.promisifyAll(fs);

const server = dgram.createSocket('udp4');

server.on('listening', function () {
    const address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', async (message, remote) => {
    await fs.appendFileAsync(outputFilename, message);
});

server.bind(PORT, HOST);
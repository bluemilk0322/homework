const dgram = require('dgram');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
Promise.promisifyAll(fs);
const filename = path.join(__dirname, 'testfile10M.txt');

const PORT = 33333;
const HOST = '127.0.0.1';
const main = async function(){
    const client = dgram.createSocket('udp4');
    client.sendAsync = Promise.promisify(client.send);

    const file = await fs.openAsync(filename, 'r');
    const filestat = await fs.fstatAsync(file);
    const filesize = filestat.size;

    let tmpBuffer = Buffer.alloc(1024);
    for (let i = 0; i <= filesize / 1024; i++){
        tmpBuffer.fill(0);
        const readBytes = await fs.readAsync(file, tmpBuffer, 0, 1024, i*1024);
        if(readBytes < 1024) client.send(tmpBuffer.slice(0, readBytes-1), 0, readBytes, PORT, HOST);
        else client.send(tmpBuffer, 0, tmpBuffer.length, PORT, HOST);
    }  
    client.close();
}

main();

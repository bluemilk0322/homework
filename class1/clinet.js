const net = require('net');
const fs = require("fs");
const readline = require('readline');
const path = require('path');
const rl = readline.createInterface({input: process.stdin,output: process.stdout});

function file(){
    return new Promise((resolve, reject) => {
        rl.question('please choose file name 1,2 or 3？', (number) => {
            let indata;
            switch(parseInt(number)){
                case 1:
                    indata = fs.readFileSync(path.join(__dirname, './testfile100K.txt'))
                    resolve(indata);
                    break;
                case 2:
                    indata = fs.readFileSync(path.join(__dirname, './testfile17K.txt'))
                    resolve(indata);
                    break;
                case 3:
                    indata = fs.readFileSync(path.join(__dirname, './testfile10M.txt'))
                    resolve(indata);
                    break;
                default:
                    reject(new Error('testasync'));
            }
            rl.close();
        });
    });
}

function connectAndTransferData(indata, callback) {
    return new Promise((resolve, reject) => {
        const HOST = '127.0.0.1';
        const PORT = 6969;

        const client = new net.Socket();
        client.connect(PORT, HOST, function() {
            console.log('CONNECTED TO: ' + HOST + ':' + PORT);
            client.write('sending Data ');
            client.write(indata);

        });

        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function(data) {
            console.log('DATA: ' + data);
            // Close the client socket completely
            client.end();
            
        });

        // Add a 'close' event handler for the client socket
        client.on('close', function() {
            console.log('Connection closed');
            resolve();
        });
    })
}


async function testasync(){
    try{
        const indata = await file();
        await connectAndTransferData(indata);
        console.log('done');
    }
    catch(err){
        console.log('You like a shit.');
    }
}

testasync();

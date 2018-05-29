const net = require('net');
const fs = require("fs");
const readline = require('readline');
const path = require('path');
const rl = readline.createInterface({input: process.stdin,output: process.stdout});
const HOST = '127.0.0.1';
const PORT = 6969;
const client = new net.Socket();

function file(){
    client.connect(PORT, HOST, () => {
        return new Promise((resolve, reject) => {
            fs.readdir("G:\\Download\\New\\網路程式設計\\Topix\\class1",(err, files) => {
                if(err) throw err;
                console.log(files);
            });
            console.log("讀取檔案中...");
            rl.once('line', (data) => {
                let inputs = data.trim().split(' ');
                let sendfile = String(inputs);
                fs.readFile(sendfile,(err,data) => {
                    if(err) throw err;
                    let indata= data.toString();
                    client.write(indata);
                });
            });
        });
    rl.close();
    });
};
function connectAndTransferData(indata, callback) {
    return new Promise((resolve, reject) => {
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data',(data) => {
            console.log('DATA: ' + data);
            // Close the client socket completely
            client.end();
            
        });
        // Add a 'close' event handler for the client socket
        client.on('close',() => {
            console.log('Connection closed');
            resolve();
        });
    });
};

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

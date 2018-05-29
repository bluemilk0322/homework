const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const fs = require('fs');
const jquery = require('jquery');

let  yee = "I'm am a homework";

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
};

io.on('connection', (socket) => {
  console.log('a user connected');
  setInterval( () => {
    socket.emit('news', { 'hello': yee });
  });
  socket.on('myText', data => {
    console.log(data);
  });
  socket.on('yes', data => {
    console.log(data);
  });
  socket.on('no', data => {
    console.log(data);
  });
});

app.listen(8082, () => {
    console.info("Server started.");
  });
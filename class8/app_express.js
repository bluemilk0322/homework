const express = require('express');
const app = express();
const bodyParser = require('body-Parser');
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const ajv = new Ajv();
Promise.promisifyAll(fs);

app.use(bodyParser.json())
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    next();
});
app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    res.status(500);
    res.render('error', { error: err });
});

app.use('/static', express.static(path.join(__dirname, 'static')));

const userSchema = {
    properties: {
        uuid: { type: 'integer' },
        name: { type: 'string' },
        profession: { type: 'string' },
        password: { type: 'string' }
    }
}
const validateUser = ajv.compile(userSchema);

let userlist = []

try { 
    fs.lstatSync('user.json');
    userDbContent = fs.readFileSync('user.json', 'utf8');
    userlist = JSON.parse(userDbContent); 
}
catch (err){ userlist = []; }
  
const saveDb = async function(){
    await fs.writeFileAsync('user.json', JSON.stringify(userlist));
}

let actions = {
    list: (req, res) => {
        res.status(200).json(userlist);
    },
    test: (req, res) => {
        res.status(418).json({message: 'test'});
    },
    get: (req, res) => {
        let findUserList = userlist.filter(user => user.uuid === parseInt(req.params.uuid));
        if (findUserList.length > 0) return res.status(200).json(findUserList[0]);
        else return res.status(404).json({error: 'User not found'});
    },
    add: async (req, res) => {
        if(!validateUser(req.bodyParser)) return res.status(400).json({error:'Incorrect data'});
        const lastUser = userlist[userlist.length-1];
        const newUser = {
        uuid: lastUser.uuid+1,
        name: req.body.name,
        password: req.body.password,
        profession: req.body.profession
        }
        userlist.push(newUser);
        await saveDb();
        res.status(201).json(newUser);
    },
    update: async (req, res) => {
        if(!validateUser(req.body)) return res.status(400).json({error:'Incorrect data'});
        let userFound = userlist.find(user => user.uuid === parseInt(req.params.uuid));
        if (!userFound) return res.status(404).json({error:'User not found'});
        Object.assign(userFound, req.body);
        await saveDb();
        res.status(200).json(userFound);
    },
    delete: async (req, res) => {
        userlist = userlist.filter(user => user.uuid !== parseInt(req.params.uuid));
        await saveDb();
        res.status(200),json({message: 'Delete successed.'});
    },
    index: (req, res) => {
        res.status(200).set('Content-Type', 'text/html').send(fs.readFileSync(path.join(__dirname, 'index.html')));
    }
}

app.get('/', actions.index);
app.get('/api/user', actions.list);
app.get('/api/user/:uuid', actions.get);
app.post('/api/user', actions.add);
app.put('/api/user/:uuid', actions.update);
app.delete('/api/user/:uuid', actions.delete);
app.get('/api/test', actions.test);

app.listen(3000, () => {
    console.info("Server started.");
  });

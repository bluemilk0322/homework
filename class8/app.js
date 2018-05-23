const koa = require('koa');
const koaRouter = require('koa-router');
const koaBodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const mount = require('koa-mount');
const Ajv = require('ajv');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const ajv = new Ajv();
const app = new koa();
const router = new koaRouter();

Promise.promisifyAll(fs);
app.use(koaBodyParser());
app.use(async(ctx, next) => {
  ctx.set('Content-Type', 'application/json');
  await next();
});
app.use(async(ctx, next) => {
  try { await next(); }
  catch(err){
    ctx.status = err.status || 500;
    ctx.body = {error: err.message};
    ctx.app.emit('error', err, ctx);
  }
})
app.use(mount('/static', serve(path.join(__dirname, 'static'))));

const userSchema = {
  properties: {
    uuid: { type: 'integer'},
    name: {type: 'string'},
    profession: { type: 'string'},
    password: {type: 'string'}
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
  list: async (ctx) => {
    ctx.body = JSON.stringify(userlist);
  },
  get: async (ctx) => {
    let findUserList = userlist.filter(user => user.uuid === parseInt(ctx.params.uuid));
    if (findUserList.length > 0) ctx.body = JSON.stringify(findUserList[0]);
    else ctx.throw(404, 'User not found');
  },
  add: async (ctx) => {
    if(!validateUser(ctx.request.body)) ctx.throw(400, 'Incorrect data');
    const lastUser = userlist[userlist.length-1];
    const newUser = {
      uuid: lastUser.uuid+1,
      name: ctx.request.body.name,
      password: ctx.request.body.password,
      profession: ctx.request.body.profession
    }
    userlist.push(newUser);
    await saveDb();
    ctx.status = 201;
    ctx.body = newUser
  },
  update: async(ctx) => {
    if(!validateUser(ctx.request.body)) ctx.throw(400, 'Incorrect data');
    let userFound = userlist.find(user => user.uuid === parseInt(ctx.params.uuid));
    if (!userFound) ctx.throw(404, 'User not found');
    Object.assign(userFound, ctx.request.body);
    await saveDb();
    ctx.status = 200
    ctx.body = userFound;
  },
  delete: async(ctx) => {
    userlist = userlist.filter(user => user.uuid !== parseInt(ctx.params.uuid));
    await saveDb();
    ctx.status = 200;
    ctx.body = {message: 'Delete successed.'}
  },
  index: async(ctx) => {
    ctx.status = 200;
    ctx.set('Content-Type', 'text/html');
    ctx.body = fs.createReadStream(path.join(__dirname, 'index.html'));
  }
}

router.get('/', actions.index)
      .get('/api/user', actions.list)
      .get('/api/user/:uuid', actions.get)
      .post('/api/user', actions.add)
      .put('/api/user/:uuid', actions.update)
      .delete('/api/user/:uuid', actions.delete);
      
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.info("Server started.");
});
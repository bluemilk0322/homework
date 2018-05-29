const path = require('path');
const fs = require('fs');
const koa = require('koa');
const koaRouter = require('koa-router');
const createError = require('http-errors');
const Promise = require('bluebird');
Promise.promisifyAll(fs);
const app = new koa();
const router = new koaRouter();

let actions = {
  index: async (ctx) => {
    ctx.response.type = 'text/html';
    ctx.response.body = fs.createReadStream(path.join(__dirname, 'static', 'index.html'));
  },
  getfile: async (ctx) => {
    const filename = ctx.params.filename;
    let total = 0;

    try{
      const stat = await fs.statAsync(path.join(__dirname, 'static', filename));
      total = stat.size;
    }
    catch(err){
      const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']
      if (notfound.includes(err.code)) {
        throw createError(404, err)
      }
      err.status = 500
      throw err
    }

    if(ctx.request.headers.range){
      const range = ctx.request.headers.range;
      console.log("Range = "+range);
      const parts = range.replace(/bytes=/, "").split("-");
      const partialstart = parts[0];
      const partialend = parts[1];
      const start = parseInt(partialstart, 10);
      const end = partialend ? parseInt(partialend, 10) : total-1; 
      const chunksize = (end-start)+1;
      console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

      ctx.response.status = 206;
      ctx.response.set('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
      ctx.response.set('Accept-Ranges', 'bytes');
      ctx.response.set('Content-Length', chunksize);
      ctx.response.set('Content-Type', 'video/mp4');
      
      console.log(ctx.response.headers);
      ctx.response.body = fs.createReadStream(path.join(__dirname, 'static', filename), {start: start, end: end});
    }
    else{
      console.log('ALL: ' + total);
      ctx.response.status = 200;
      ctx.response.set('Content-Length', total);
      ctx.response.set('Content-Type', 'video/mp4');
      ctx.response.body = fs.createReadStream(path.join(__dirname, 'static', filename));
    }
  }
}

router.get('/', actions.index).get('/:filename', actions.getfile);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.info("Server started.");
});
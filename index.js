const Git = require('nodegit');
const fs = require('fs');
const util = require('util');
const path = require('path');

const express = require('express');
const http = require('http');
const reload = require('reload/lib/reload');
const cheerio = require('cheerio');

const app = express()

const readFileAsync = util.promisify(fs.readFile);
const rmdirAsync = util.promisify(fs.rmdir);

const tempDir = path.join(__dirname, 'tmp');

const IS_PROD = process.env.NODE_ENV === 'production';
let works = [];
let currentWorkIndex = -1;
let lastRunFailed = false;
let reloadInstance = null;

app.set('port', process.env.PORT || 8765);

/*
  we need to attach our own reload injection stuff
  here because reload doesn't expose a method for
  using the same port for ws and http by default
  so we gotta do this manually
*/

const RELOAD_FILE = path.join(__dirname, './node_modules/reload/lib/reload-client.js');
let reloadCode = fs.readFileSync(RELOAD_FILE, 'utf8');

const webSocketString = IS_PROD ? 'wss://$3' : 'ws$2://$3$4';

reloadCode = reloadCode.replace(
  'socketUrl.replace()',
  'socketUrl.replace(/(^http(s?):\\/\\/)(.*:)(.*)/,' + '\'' + webSocketString + '\')');

const reloadRoute = '/reload/reload.js';

app.get(reloadRoute, function (req, res) {
  res.type('text/javascript')
  res.send(reloadCode)
});

app.get('/', function (req, res) {
  const work = works[currentWorkIndex];

  const html = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
  const $ = cheerio.load(html);
  const scriptNode = '<script src="/reload/reload.js"></script>';
  $('body').append(scriptNode);

  const viewport = `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">`;
  $('head').append(viewport);

  const fullscreenScript = `<div style="
  position: absolute;
  font-size: 3rem;
  text-shadow: #fff 2px 2px;
  font-family: monospace;
  bottom: 1rem;
  left: 1rem;
"><div>${work.title}</div><div>by ${work.author}</div></div>`;
  $('body').append(fullscreenScript);

  res.send($.html());
})

const server = http.createServer(app)

async function start() {
  let worksJson;

  try {
    worksJson = await readFileAsync('./works.json');
  } catch (err) {
    console.error(err);
    return;
  }

  works = JSON.parse(worksJson);

  try {
    reloadInstance = await reload(app, {}, server);
  } catch (err) {
    console.error('Reload could not start, could not start server/sample app', err);
    process.exit();
  }

  server.listen(app.get('port'), () => {
    console.log('Web server listening on port', app.get('port'));
    loadNext();
  });
}

async function loadNext() {
  const newWorkIndex = Math.floor(Math.random() * works.length);

  if (currentWorkIndex === newWorkIndex && lastRunFailed) {
    process.exit();
  }

  currentWorkIndex = newWorkIndex;
  const work = works[currentWorkIndex];

  try {
    await rmdirAsync(tempDir, { recursive: true });
  } catch(e) {
    console.error(e);
  }

  try {
    gitResult = await Git.Clone(work.repo, tempDir);
  } catch(e) {
    lastRunFailed = true;
    console.error(e);
    loadNext();
  }

  lastRunFailed = false;

  reloadInstance.reload();
  setTimeout(loadNext, 1000 * 60);
}

start();

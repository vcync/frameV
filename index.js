const Git = require('nodegit');
const fs = require('fs');
const util = require('util');
const path = require('path');

const express = require('express');
const http = require('http');
const reload = require('reload/lib/reload');
const cheerio = require('cheerio');

const clientsideCodeGenerator = require('./client.js');

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
  let workDir = tempDir;

  if (works[currentWorkIndex].dir) {
    workDir = path.join(tempDir, works[currentWorkIndex].dir);
  }

  app.use('/static', express.static(workDir));
  let html = '';

  try {
    html = fs.readFileSync(path.join(workDir, 'index.html'), 'utf8');
  } catch(e) {
    try {
      html = fs.readFileSync(path.join('./', 'loading.html'), 'utf8');
    } catch(e) {
      console.error(e);
      return;
    }
  }

  const $ = cheerio.load(html);
  const scriptNode = '<script src="/reload/reload.js"></script>';
  $('body').append(scriptNode);
  $('html').attr('lang', 'en');
  $('title').remove();
  $('head').append(`<title>${work.title} - ${work.author} | frameV</title>`);
  $('head').append(`<meta name="description" content="Framed Visuals: collaborative generative art.">`);

  const viewport = `
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://v36p9.csb.app/style.css" rel="stylesheet" />
    <style>
      .work-details {
        position: absolute;
        font-size: 2rem;
        bottom: 1rem;
        left: 1rem;
        font-weight: 100;
        mix-blend-mode: difference;
        color: #fff;
        text-decoration: none;
      }

      .contribute-link {
        font-size: 1rem;
        position: absolute;
        right: 1rem;
        top: 1rem;
        font-weight: 100;
        mix-blend-mode: difference;
        color: #fff;
        text-decoration: none;
      }

      .modal-hidden {
        display: none;
      }

      .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 1em;
        box-sizing: border-box;
        background-color: #fff;
      }

      @media (prefers-reduced-motion: reduce) {
        .show-if-prefers-reduced-motion {
          display: block;
        }
      }
    </style>`;
  $('head').append(viewport);

  const clientStrings = clientsideCodeGenerator(work)
  $('body').append(clientStrings);

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
    return;
  }

  lastRunFailed = false;

  reloadInstance.reload();
  setTimeout(loadNext, 1000 * 60);
}

start();

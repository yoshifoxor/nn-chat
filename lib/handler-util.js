'use strict';
const fs = require('node:fs');

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.end(
    `<!DOCTYPE html>
    <html lang="ja"><body>
    <h1>ログアウトしました</h1>
    <a href="/posts">ログイン</a>
    </body></html>`
  );
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
    'Cache-Control': 'public, max-age=604800'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
  });
  const file = fs.readFileSync('./stylesheets/style.css');
  res.end(file);
}

function handleNnChatJsFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript',
  });
  const file = fs.readFileSync('./public/nn-chat.js');
  res.end(file);
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  res.write('<p>ページがみつかりません</p>');
  res.write('<p><a href="/posts">NNチャット</a></p>');
  res.end();
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('未対応のメソッドです');
}

module.exports = {
  handleLogout,
  handleFavicon,
  handleStyleCssFile,
  handleNnChatJsFile,
  handleNotFound,
  handleBadRequest,
};

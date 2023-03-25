'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const Post = require('./post');
const util = require('./handler-util');
const currentThemeKey = 'current_theme';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const crypto = require('crypto');
const oneTimeTokenMap = new Map();

async function handle(req, res) {
  const cookies = new Cookies(req, res);
  let currentTheme = cookies.get(currentThemeKey);
  if (!currentTheme) {
    currentTheme = 'light';
    cookies.set(currentThemeKey, currentTheme);
  }

  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        // 'Content-Security-Policy': "default-src 'self'; script-src https://*; style-src https://*"
      });
      const posts = await Post.findAll({ order: [['id', 'DESC']] });
      posts.forEach(post => {
        post.formattedCreatedAt = dayjs(post.createdAt).tz('Asia/Tokyo').format('YYYY年MM月DD日 HH時mm分ss秒');
      });
      const oneTimeToken = crypto.randomBytes(8).toString('hex');
      oneTimeTokenMap.set(req.user, oneTimeToken);
      res.end(pug.renderFile('./views/posts.pug', {
          currentTheme,
          posts,
          user: req.user,
          oneTimeToken,
        }));
      console.info(
        `閲覧されました: user: ${req.user}, ` +
        `remoteAddress: ${req.socket.remoteAddress}, ` +
        `userAgent: ${req.headers['user-agent']} `
      );
      break;
    case 'POST':
      let body = '';
      req.on('data', chunk => {
          body += chunk;
        }).on('end', async () => {
          const params = new URLSearchParams(body);
          const content = params.get('content');
          const requestedOneTimeToken = params.get('oneTimeToken');
          if (!(content && requestedOneTimeToken)) {
            util.handleBadRequest(req, res);
          } else {
            if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
              console.info(`送信されました: ${content}`);
              await Post.create({
                content: content,
                postedBy: req.user,
              });
              oneTimeTokenMap.delete(req.user);
              handleRedirectPosts(req, res);
            } else {
              util.handleBadRequest(req, res);
            }
          }
        });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on('data', chunk => {
          body = [...body, chunk];
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          const params = new URLSearchParams(body);
          const id = params.get('id');
          const requestedOneTimeToken = params.get('oneTimeToken');
          if (!(id && requestedOneTimeToken)) {
            util.handleBadRequest(req, res);
          } else {
            if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
              Post.findByPk(id).then(post => {
                if (req.user === post.postedBy || req.user === 'admin') {
                  post.destroy().then(() => {
                    console.info(
                      `削除されました: user: ${req.user}, ` +
                        `remoteAddress: ${req.socket.remoteAddress}, ` +
                        `userAgent: ${req.headers['user-agent']} `
                    );
                    oneTimeTokenMap.delete(req.user);
                    handleRedirectPosts(req, res);
                  });
                } else {
                  util.handleBadRequest(req, res);
                }
              });
            } else {
              util.handleBadRequest(req, res);
            }
          }
        });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

/**
 * Cookieに含まれているトラッキングIDに異常がなければその値を返し、
 * 存在しない場合や異常なものである場合には、再度作成しCookieに付与してその値を返す
 * @param {Cookies} cookies
 * @param {String} userName
 * @return {String} トラッキングID
 */
function addTrackingCookie(cookies, userName) {
  const requestedTrackingId = cookies.get(trackingIdKey);
  if (isValidTrackingId(requestedTrackingId, userName)) {
    return requestedTrackingId;
  } else {
    const originalId = parseInt(crypto.randomBytes(8).toString('hex'), 16);
    const tomorrow = new Date(Date.now() + (1000 * 60 * 60 * 24));
    const trackingId = `${originalId}_${createValidHash(originalId, userName)}`;
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
    return trackingId;
  }
}

function isValidTrackingId(trackingId, userName) {
  if (!trackingId) {
    return false;
  }
  const [originalId, requestedHash] = trackingId.split('_');
  const expectedHash = createValidHash(originalId, userName);
  return requestedHash === expectedHash;
}

function createValidHash(originalId, userName) {
  const sha1sum = crypto.createHash('sha1');
  sha1sum.update(originalId + userName + secretKey);
  return sha1sum.digest('hex');
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    Location: '/posts',
  });
  res.end();
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = '';
      req.on('data', chunk => {
          body += chunk;
        }).on('end', async () => {
          const params = new URLSearchParams(body);
          const id = params.get('id');
          const requestedOneTimeToken = params.get('oneTimeToken');
          if (!(id && requestedOneTimeToken)) {
            util.handleBadRequest(req, res);
          } else {
            if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
              const post = await Post.findByPk(id);
              if (req.user === post.postedBy || req.user === 'admin') {
                await post.destroy();
                console.info(
                  `削除されました: user: ${req.user}, ` +
                  `remoteAddress: ${req.socket.remoteAddress}, ` +
                  `userAgent: ${req.headers['user-agent']} `
                );
                oneTimeTokenMap.delete(req.user);
                handleRedirectPosts(req, res);
              } else {
                util.handleBadRequest(req, res);
              }
            }
          }
        });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

module.exports = {
  handle,
  handleDelete,
};

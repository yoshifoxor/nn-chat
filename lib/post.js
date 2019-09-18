'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'secret_board', 'postgres', 'kus10a93w',
  {
    dialect: 'postgres',
    logging: false,
    operatorsAliases: false
  }); //'postgres://postgres:postgres@localhost/secret_board'

const Post = sequelize.define('Post', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: Sequelize.TEXT
  },
  postedBy: {
    type: Sequelize.STRING
  },
  trackingCookie: {
    type: Sequelize.STRING
  }
}, {
  freezeTableName: true,
  timestamps: true
});

Post.sync();
module.exports = Post;

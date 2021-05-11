'use strict';
const Sequelize = require('sequelize');
const { database, dialect, username, password } = require('./sequelizeConfig');

const sequelize = new Sequelize(database, username, password, {
  dialect: dialect,
  logging: false,
});
const Post = sequelize.define(
  'Post',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: Sequelize.TEXT,
    },
    postedBy: {
      type: Sequelize.STRING,
    },
    trackingCookie: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

Post.sync();
module.exports = Post;

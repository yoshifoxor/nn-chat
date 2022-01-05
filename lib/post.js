'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const { database, dialect, host, username, password } = require('./sequelizeConfig');

const sequelize = new Sequelize(database, username, password, {
  dialect: dialect,
  host: host,
  logging: false,
});
const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    postedBy: {
      type: DataTypes.STRING,
    },
    trackingCookie: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

Post.sync();
module.exports = Post;

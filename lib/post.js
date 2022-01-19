'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const { database, dialect, dialectOptions, host, username, password } = require('./sequelizeConfig');

const defaultOptions = { dialect, logging: false };

const sequelize = process.env.DATABASE_URL ?
  // 本番環境
  new Sequelize(process.env.DATABASE_URL, {
    ...defaultOptions, dialectOptions
  }) :
  // 開発環境
  new Sequelize(database, username, password, {
    ...defaultOptions, host
  });

const Post = sequelize.define('Post',
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

'use strict';
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  // Define the user model
  var User = sequelize.define('User', {
    // The user has an id, which identifies them and acts as a primary key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // The user has a "username", of the string datatype, that is unique
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
          args: true,
          msg: "Username already exists; it must be unique."
      }
    },

    // The user has a "password", composed of a hash and salt
    hash: DataTypes.TEXT('long'),
    salt: DataTypes.TEXT('long')
  })

  User.prototype.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  User.prototype.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  User.prototype.generateJWT = function() {
    const today = new Date();
    const expires = new Date(today);
    expires.setDate(today.getDate() + 30);

    return jwt.sign({
      username: this.username,
      id: this.id,
      exp: parseInt(expires.getTime() / 1000, 10),
    }, 'secret');
  }

  User.prototype.toAuthJSON = function() {
      return {
        id: this.id,
        username: this.username,
        token: this.generateJWT()
      };
  }

  User.prototype.toJSON = function() {
    return {
      id: this.id,
      username: this.username
    }
  }

  return User;
}

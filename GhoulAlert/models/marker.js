'use strict';

module.exports = (sequelize, DataTypes) => {
  var Marker = sequelize.define('Marker', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },

      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Name of the marker must be unique"
        },
        validate: {
          notEmpty: true
        }
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
      }
  });

  return Marker;
}

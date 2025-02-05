/*Powered By: Manaknightdigital Inc. https://manaknightdigital.com/ Year: 2021*/
/**
 * Terminate Model
 * @copyright 2021 Manaknightdigital Inc.
 * @link https://manaknightdigital.com
 * @license Proprietary Software licensing
 * @author Ryan Wong
 *
 */

const moment = require("moment");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { intersection } = require("lodash");
const coreModel = require("../core/models");

module.exports = (sequelize, DataTypes) => {
  const Terminate = sequelize.define(
    "terminate",
    {
      message: DataTypes.STRING,
      counter: DataTypes.STRING,
      timestamp: DataTypes.DATE,
      created_at: DataTypes.DATEONLY,
      updated_at: DataTypes.DATE,
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: "terminate",
    }
  );
  coreModel.call(this, Terminate);

  Terminate._preCreateProcessing = function (data) {
    return data;
  };
  Terminate._postCreateProcessing = function (data) {
    return data;
  };
  Terminate._customCountingConditions = function (data) {
    return data;
  };

  Terminate._filterAllowKeys = function (data) {
    let cleanData = {};
    let allowedFields = Terminate.allowFields();
    allowedFields.push(Terminate._primaryKey());

    for (const key in data) {
      if (allowedFields.includes(key)) {
        cleanData[key] = data[key];
      }
    }
    return cleanData;
  };

  Terminate.timeDefaultMapping = function () {
    let results = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j++) {
        let hour = i < 10 ? "0".i : i;
        let min = j < 10 ? "0".j : j;
        results[i * 60 + j] = `${hour}:${min}`;
      }
    }
    return results;
  };

  //   Terminate.associate = function(models) {
  // Terminate.hasMany(models.question, {
  //                 foreignKey: "quiz_id",
  //                 as: "questions",
  //                 constraints: false,
  //               }) };

  Terminate.allowFields = function () {
    return ["quiz_id", "id", "message", "counter"];
  };

  Terminate.labels = function () {
    return ["ID", "Message", "Counter"];
  };

  Terminate.validationRules = function () {
    return [
      ["id", "ID", ""],
      ["name", "Name", "required"],
      ["description", "Description", ""],
    ];
  };

  Terminate.validationEditRules = function () {
    return [
      ["id", "ID", ""],
      ["name", "Name", "required"],
      ["description", "Description", ""],
    ];
  };

  Terminate.get_terminate_paginated = function (db, where = {}, ...rest) {
    return Terminate.getPaginated(...rest, [
      {
        model: db.terminate,
        where: {},
        required: Object.keys(where).length > 0 ? true : false,
      
      },
    ]);
  };


  // ex
  Terminate.intersection = function (fields) {
    if (fields) {
      return intersection(
        ["id", "name", "description", "created_at", "updated_at"],
        Object.keys(fields)
      );
    } else return [];
  };

  return Terminate;
};

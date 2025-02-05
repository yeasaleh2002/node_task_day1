"use strict";
const db = require("../../models");
const app = require("express").Router();

app.get(
  "/api/v1/member/terminate",
  async function (req, res, next) {
    try {
      const result = await db.terminate.findByPk(1);
      return res.json({ data: result });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = app;

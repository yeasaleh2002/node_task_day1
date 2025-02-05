"use strict";

const ValidationService = require("../../services/ValidationService");
const AuthService = require("../../services/AuthService");
const JWTService = require("../../services/JwtService");
const SessionService = require("../../services/SessionService");
const PasswordService = require("../../services/PasswordService");
const db = require("../../models");
const helpers = require("../../core/helpers");
const { validateEmail } = require("../../core/utils");
const app = require("express").Router();

const role_id = 2;

app.get(
  "/api/v1/member/terminate",
  // SessionService.verifySessionMiddleware(role_id, "member"),
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

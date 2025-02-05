"use strict";
const SessionService = require("../../services/SessionService");
const db = require("../../models");
const app = require("express").Router();

const role_id = 1;

app.get(
  "/admin/terminate",
  SessionService.verifySessionMiddleware(role_id, "admin"),

  async function (req, res, next) {
    const user = await db.user.getByPK(req.session.user);

    const TerminateViewModel = require("../../view_models/admin_terminate_view_model");
    const viewModel = new TerminateViewModel(db.terminate, "Terminate");
    viewModel._base_url = "/admin/terminate";

    if (!user || !user.id) {
      viewModel.error = "User Not Found";
      return res.render("admin/Terminate", viewModel);
    }

    try {
      const terminateData = await db.terminate.getByUserId(user.id);
      if (!terminateData) {
        viewModel.error = "Terminate Data Not Found";
        return res.render("admin/Terminate", viewModel);
      }

      viewModel.data = terminateData;
      return res.render("admin/Terminate", viewModel);
    } catch (error) {
      viewModel.error = "Something went wrong";
      return res.render("admin/Terminate", viewModel);
    }
  }
);

app.post(
  "/admin/terminate",

  SessionService.verifySessionMiddleware(role_id, "admin"),

  async function (req, res, next) {
    const user = await db.user.getByPK(req.session.user);

    const TerminateViewModel = require("../../view_models/admin_terminate_view_model");
    const viewModel = new TerminateViewModel(db.terminate, "Terminate");
    viewModel._base_url = "/admin/terminate";

    if (!user || !user.id) {
      viewModel.error = "User Not Found";
      return res.render("admin/Terminate", viewModel);
    }

    const { message, counter } = req.body;

    try {
      if (!message || !counter) {
        viewModel.error = "Message and Counter are required";
        return res.render("admin/Terminate", viewModel);
      }

      const terminateEntry = await db.terminate.create({
        user_id: user.id,
        message,
        counter,
      });

      viewModel.success = "Terminate Entry Created Successfully";
      return res.render("admin/Terminate", viewModel);
    } catch (error) {
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Terminate", viewModel);
    }
  }
);

app.put(
  "/admin/terminate/:id",

  SessionService.verifySessionMiddleware(role_id, "admin"),

  async function (req, res, next) {
    const user = await db.user.getByPK(req.session.user);

    const TerminateViewModel = require("../../view_models/admin_terminate_view_model");
    const viewModel = new TerminateViewModel(db.terminate, "Terminate");
    viewModel._base_url = "/admin/terminate";

    if (!user || !user.id) {
      viewModel.error = "User Not Found";
      return res.render("admin/Terminate", viewModel);
    }

    const { message, counter } = req.body;
    const { id } = req.params;

    try {
      const terminateEntry = await db.terminate.getById(id);
      if (!terminateEntry) {
        viewModel.error = "Terminate Entry Not Found";
        return res.render("admin/Terminate", viewModel);
      }

      await db.terminate.update(id, { message, counter });
      viewModel.success = "Terminate Entry Updated Successfully";
      return res.render("admin/Terminate", viewModel);
    } catch (error) {
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Terminate", viewModel);
    }
  }
);

module.exports = app;

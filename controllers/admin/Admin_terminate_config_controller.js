"use strict";

const app = require("express").Router();
const Sequelize = require("sequelize");
const logger = require("../../services/LoggingService");
let pagination = require("../../services/PaginationService");
let SessionService = require("../../services/SessionService");
let JwtService = require("../../services/JwtService");
const ValidationService = require("../../services/ValidationService");
const PermissionService = require("../../services/PermissionService");
const UploadService = require("../../services/UploadService");
const AuthService = require("../../services/AuthService");
const db = require("../../models");
const helpers = require("../../core/helpers");

const role = 1;

app.get(
  "/admin/terminates/:num",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    try {
      let session = req.session;
      let paginateListViewModel = require("../../view_models/terminate_admin_list_paginate_view_model");

      var viewModel = new paginateListViewModel(
        db.terminate,
        "Terminate",
        session.success,
        session.error,
        "/admin/terminates"
      );

      const format = req.query.format || "view";
      const direction = req.query.direction || "ASC";
      const per_page = req.query.per_page || 10;
      let order_by = req.query.order_by || "id";

      const flashMessageSuccess = req.flash("success");
      if (flashMessageSuccess.length > 0) {
        viewModel.success = flashMessageSuccess[0];
      }
      const flashMessageError = req.flash("error");
      if (flashMessageError.length > 0) {
        viewModel.error = flashMessageError[0];
      }

      viewModel.set_id(req.query.id || "");
      viewModel.set_name(req.query.name || "");

      let where = helpers.filterEmptyFields({
        id: viewModel.get_id(),
        name: viewModel.get_name(),
      });

      viewModel.set_per_page(+per_page);
      viewModel.set_page(+req.params.num);
      viewModel.set_query(req.query);
      viewModel.set_sort_base_url(`/admin/terminates/${+req.params.num}`);
      viewModel.set_sort(direction);

      // const list = await db.terminate.get_terminate_paginated(
      //   db,
      //   {},
      //   viewModel.get_page() - 1 < 0 ? 0 : viewModel.get_page(),
      //   viewModel.get_per_page(),
      //   where,
      //   order_by,
      //   direction,
      //   []
      // );

      const list = await db.terminate.findAll(); // Fetch all items from the terminate table
      // return res.json(list);
      viewModel.set_list(list);

      if (format == "csv") {
        const csv = viewModel.to_csv();
        return res
          .set({
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="export.csv"',
          })
          .send(csv);
      }

      return res.render("admin/terminates", viewModel);
    } catch (error) {
      console.error(error);
      return res.render("admin/terminates", {
        error: error.message || "Something went wrong",
      });
    }
  }
);

app.get(
  "/admin/terminates-add",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }

    const quizzesAdminAddViewModel = require("../../view_models/quizzes_admin_add_view_model");

    const viewModel = new quizzesAdminAddViewModel(
      db.quiz,
      "Add quiz",
      "",
      "",
      "/admin/quizzes"
    );

    res.render("admin/Add_Quizzes", viewModel);
  }
);

app.post(
  "/admin/terminates-add",
  SessionService.verifySessionMiddleware(role, "admin"),
  ValidationService.validateInput(
    { name: "required" },
    { "name.required": "Name is required" }
  ),
  async function (req, res, next) {
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }
    const quizzesAdminAddViewModel = require("../../view_models/quizzes_admin_add_view_model");

    const viewModel = new quizzesAdminAddViewModel(
      db.quiz,
      "Add quiz",
      "",
      "",
      "/admin/quizzes"
    );

    // TODO use separate controller for image upload
    //  {{{upload_field_setter}}}

    const { name, description } = req.body;

    viewModel.form_fields = {
      ...viewModel.form_fields,
      name,
      description,
    };

    try {
      if (req.validationError) {
        viewModel.error = req.validationError;
        return res.render("admin/Add_Quizzes", viewModel);
      }

      viewModel.session = req.session;

      const data = await db.quiz.insert({ name, description });

      if (!data) {
        viewModel.error = "Something went wrong";
        return res.render("admin/Add_Quizzes", viewModel);
      }

      await db.activity_log.insert({
        action: "ADD",
        name: "Admin_quiz_controller.js",
        portal: "admin",
        data: JSON.stringify({ name, description }),
      });

      req.flash("success", "Quiz created successfully");
      return res.redirect("/admin/quizzes/0");
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Add_Quizzes", viewModel);
    }
  }
);

app.get(
  "/admin/terminates-edit/:id",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    let id = req.params.id;
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }
    const AdminEditViewModel = require("../../view_models/terminate_admin_edit_view_model");

    const viewModel = new AdminEditViewModel(
      db.terminate,
      "Edit Terminate",
      "",
      "",
      "/admin/terminates"
    );

    try {
      const exists = await db.terminate.getByPK(id);

      if (!exists) {
        req.flash("error", "Quiz not found");
        return res.redirect("/admin/terminates/0");
      }
      const values = exists;
      Object.keys(viewModel.form_fields).forEach((field) => {
        viewModel.form_fields[field] = values[field] || "";
      });
      viewModel.question = db.question;
      return res.render("admin/Edit_Terminates", viewModel);
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Edit_Terminates", viewModel);
    }
  }
);

app.post(
  "/admin/terminates-edit/:id",
  SessionService.verifySessionMiddleware(role, "admin"),
  ValidationService.validateInput(
    { message: "required" },
    { "name.required": "Name is required" }
  ),
  async function (req, res, next) {
    let id = req.params.id;
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }

    const AdminEditViewModel = require("../../view_models/terminate_admin_edit_view_model");

    const viewModel = new AdminEditViewModel(
      db.terminate,
      "Edit terminates",
      "",
      "",
      "/admin/terminates"
    );

    const { message, counter } = req.body;

    viewModel.form_fields = {
      ...viewModel.form_fields,
      message,
      counter,
    };

    delete viewModel.form_fields.id;

    try {
      if (req.validationError) {
        viewModel.error = req.validationError;
        return res.render("admin/Edit_Terminates", viewModel);
      }

      const resourceExists = await db.terminate.getByPK(id);
      if (!resourceExists) {
        req.flash("error", "terminate not found");
        return res.redirect("/admin/terminates/0");
      }

      viewModel.session = req.session;

      let data = await db.terminate.edit({ message, counter }, id);
      if (!data) {
        viewModel.error = "Something went wrong";
        return res.render("admin/Edit_Terminates", viewModel);
      }

      if (resourceExists.questions) {
        if (resourceExists.questions.length == 1) {
          resourceExists.questions.forEach(async (item) => {
            data = await db.question.edit(
              helpers.filterEmptyFields({}),
              item.id
            );
            if (!data) {
              viewModel.error = "Something went wrong";
              return res.render("admin/Edit_Quizzes", viewModel);
            }
          });
        } else {
          resourceExists.questions.forEach(async (item, index) => {
            data = await db.question.edit(
              helpers.filterEmptyFields({}),
              item.id
            );
            if (!data) {
              viewModel.error = "Something went wrong";
              return res.render("admin/Edit_Quizzes", viewModel);
            }
          });
        }
      }

      await db.activity_log.insert({
        action: "EDIT",
        name: "Admin_terminate_controller.js",
        portal: "admin",
        data: JSON.stringify({ message, counter }),
      });

      req.flash("success", "Terminate edited successfully");

      return res.redirect("/admin/terminates/0");
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Edit_Terminates", viewModel);
    }
  }
);

module.exports = app;

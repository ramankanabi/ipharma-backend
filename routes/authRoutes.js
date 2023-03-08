const express = require("express");
const Router = express.Router();
const authController = require("../controllers/authController");
const companyController = require("../controllers/companyController");
const pharmacyController = require("../controllers/pharmacyController");
Router.route("/company/signup").post(
  authController.encryptPassword,
  companyController.createCompany,
  authController.signUp("company")
);
Router.route("/pharmacy/signup").post(
  authController.encryptPassword,
  pharmacyController.createPharmacy,
  authController.signUp("pharmacy")
);

Router.route("/company/login").post(authController.login("company"));

Router.route("/pharmacy/login").post(authController.login("pharmacy"));

module.exports = Router;

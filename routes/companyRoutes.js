const companyController = require("../controllers/companyController");
const express = require("express");
const Router = express.Router();

Router.route("/")
  .post(companyController.createCompany)
  .get(companyController.getAllCompanies);
Router.route("/:id").get(companyController.getOneCompany).delete(companyController.deleteCompany);

module.exports = Router;

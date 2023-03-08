const pharmacyController = require("../controllers/pharmacyController");
const express = require("express");
const { get } = require("mongoose");
const Router = express.Router();

Router.route("/")
  .post(pharmacyController.createPharmacy)
  .get(pharmacyController.getAllPharmacy);
Router.route("/:id")
  .get(pharmacyController.getOnePharmacy)
  .delete(pharmacyController.deleteOnePhramcy);

module.exports = Router;

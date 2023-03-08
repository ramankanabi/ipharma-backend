const express = require("express");
const Router = express.Router();

const drugController = require("../controllers/drugController");

Router.route("/postDrug").post(
  drugController.getImage,
  drugController.postDrug,
  drugController.addBonus,
  drugController.resizeDrugImages,
);
Router.route("/").get(drugController.getAllDrugs);

Router.route("/:id")
  .get(drugController.getOneDrug)
  .delete(drugController.deleteDrug)
  .patch(drugController.updateDrug);

module.exports = Router;

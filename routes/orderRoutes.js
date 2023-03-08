const express = require("express");
const Router = express.Router();
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");

Router.route("/").post(
  authController.protect("pharmacy"),
  orderController.createOrder
);
Router.route("/status/:id").patch(orderController.makeOrderStatus);
Router.route("/cancel/:id").patch(orderController.cancelOrder);
// Router.route("/:id")
//   .get(orderController.getOneDrug)
//   .delete(orderController.deleteDrug)
//   .patch(orderController.updateDrug);

module.exports = Router;

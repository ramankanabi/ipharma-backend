const catchAsyn = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const db = require("../database/database");

exports.createOrder = catchAsyn(async (req, res, next) => {
  console.log(req.user);
//   const pharmacy=await db("pharmacy").select().where("id",req.user.id.first).first();

// if(!pharmacy){

// }

  insertObj = {
    customer_id: 1,
    drug_id: req.body.drug_id,
    quantity: req.body.quantity,
    note: req.body.note,
  };

  const orderId = await db("orders").insert(insertObj);

  res.status(201).json({
    message: "success",
    data: insertObj,
  });
});

exports.makeOrderStatus = catchAsyn(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await db("orders").select().where("id", orderId).first();

  if (!order) {
    return next(new AppError("don't found any order with that id", 404));
  }
  if (!req.body.status || req.body.status == 0) {
    return next(new AppError("somthings went wrong", 400));
  }

  if (order.status == 3) {
    return next(new AppError("the order was canceled before", 400));
  }

  if (req.body.status == 3) {
    return next(
      new AppError("the order can be canceled only by the owner", 400)
    );
  }

  await db("orders").where("id", orderId).update({
    status: req.body.status,
  });

  res.status(201).json({
    message: "success",
  });

  next();
});

exports.cancelOrder = catchAsyn(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await db("orders").select().where("id", orderId).first();

  if (!order) {
    return next(new AppError("don't found any order with that id", 404));
  }
  if (order.status != 0) {
    return next(new AppError("the order can't be cancel", 400));
  }

  await db("orders").where("id", orderId).update({
    status: 3,
  });

  res.status(201).json({
    message: "The order was canceled",
  });

  next();
});

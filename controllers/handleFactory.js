const db = require("../database/database");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    const data = await db(model).select();

    res.status(200).json({
      message: "success",
      result: data.length,
      data: data,
    });
    next();
  });

exports.getOne = (model) =>
  catchAsync(async (req, res, next) => {
    const data = await db(model).select().where("id", req.params.id);

    res.status(200).json({
      message: "success",
      data: data,
    });
    next();
  });

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const data = await db(model).where({id:req.params.id}).delete();

    res.status(202).json({
      message: "deleted",
      data:data
    });
    next();
  });

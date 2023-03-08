const db = require("../database/database");
const catchAsync = require("../utils/catchAsync");
const handleFactory = require("./handleFactory");
const AppError = require("../utils/appError");
exports.createCompany = catchAsync(async (req, res, next) => {
  const insertObj = {
    name: req.body.name,
    logo: req.body.logo,
    email: req.body.email,
    phone: req.body.phone,
    city: req.body.city,
    subscription_end: req.body.subscription_end,
    password: req.password,
    type: 1,
  };
  const companyId = await db("company").insert(insertObj);

  req.companyId = companyId;
  req.companyData = insertObj;
  next();
});

exports.getAllCompanies = handleFactory.getAll("company");

exports.getOneCompany = handleFactory.getOne("company");
exports.deleteCompany = handleFactory.deleteOne("company");
exports.updateCompany = catchAsync(async (req, res, next) => {
  const body = req.body;
  const data = await db("company").where("id", req.params.id).update({
    name: body.name,
    email: body.email,
    phone: body.phone,
  });
  if (!data) {
    return next(new AppError("A company not updated or not found", 404));
  }
  res.status(201).json({
    message: "updated",
  });

  next();
});

const admin = require("firebase-admin");
const credential = require("../firebase-admin-sdk.json");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const db = require("../database/database");
const { promisify } = require("util");
dotenv.config({ path: "./config.env" });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (userData, userId, statusCode, req, res) => {
  const token = signToken(userId);
  console.log(userId);
  const { ["password"]: password, ...data } = userData;
  res.status(statusCode).json({
    status: "success",
    token,
    data,
  });
};

exports.encryptPassword = catchAsync(async (req, res, next) => {
  if (!req.body.password) {
    return next(new AppError("you should enter a password", 400));
  }
  if (req.body.password.length < 8) {
    return next(
      new AppError(
        "a password length should be equal or greator than 8 charachters",
        400
      )
    );
  }
  req.password = await bcrypt.hash(req.body.password, 12);
  next();
});

exports.signUp = (model) =>
  catchAsync(async (req, res, next) => {
    const userId = model == "company" ? req.companyId : req.pharmacyId;
    const userData = model == "company" ? req.companyData : req.pharmacyData;
    createSendToken(userData, userId, 201, req, res);
    next();
  });

exports.login = (model) =>
  catchAsync(async (req, res, next) => {
    const phoneNumber = req.body.phone;
    const password = req.body.password;

    if (!phoneNumber || !password) {
      return next(new AppError("check the phone number and password"), 404);
    }
    const user = await db(model).select().where("phone", phoneNumber).first();
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!user || !checkPassword) {
      return next(new AppError("check the phone number and password", 401));
    }
    createSendToken(user, user.id, 200, req, res);
  });

exports.protect = (model) =>
  catchAsync(async (req, res, next) => {
    //getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("you are not loged ! please login to get access.")
      );
    }

    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await db(model).select().where("id", decode.id[0]).first();

    if (!currentUser) {
      return next(
        new AppError("the user belonging to this token does no longer exist")
      );
    }

    // if (parseInt(currentUser.loginDate.getTime() / 1000, 10) > decode.iat) {
    //   return next(new AppError("this token has been expired"));
    // }

    req.user = currentUser;
    next();
  });

exports.validatePhoneNumber = catchAsync(async (req, res, next) => {
  const phoneNumberIsValid = await admin.auth().verifyIdToken(req.body.token);

  if (!phoneNumberIsValid) {
    next(new AppError("Please verify the phone number", 400));
  }
  next();
});

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError("you have not permission to do this acion", 403)
      );
    }
    next();
  };
};

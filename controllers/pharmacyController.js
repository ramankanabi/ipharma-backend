const catchAsync = require("../utils/catchAsync");
const db = require("../database/database");
const handleFactory = require("../controllers/handleFactory");

exports.createPharmacy = catchAsync(async (req, res, next) => {
  const body = req.body;
  const password = req.password;
  const insertObj = {
    name: body.name,
    owner_name: body.ownerName,
    logo: body.logo,
    phone: body.phone,
    email: body.email,
    city: body.city,
    address: body.address,
    lng: body.lng,
    lat: body.lat,
    subscription_end_time: new Date(
      new Date().setMonth(new Date().getMonth() + 3)
    ),
    password: password,
    type:0
  };

  req.pharmacyId = await db("pharmacy").insert(insertObj);

  req.pharmacyData = insertObj;
  next();
});

exports.getAllPharmacy = handleFactory.getAll("pharmacy");

exports.getOnePharmacy = handleFactory.getOne("pharmacy");
exports.deleteOnePhramcy = handleFactory.deleteOne("pharmacy");

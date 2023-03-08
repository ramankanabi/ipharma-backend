const db = require("../database/database");
const catchAsync = require("../utils/catchAsync");
const handleFactory = require("./handleFactory");
const AppError = require("../utils/appError");
const _ = require("lodash");
const multer = require("multer");
const admin = require("firebase-admin");
const sharp = require("sharp");
const fs = require("fs");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.getImage = upload.fields([{ name: "images", maxCount: 6 }]);

exports.resizeDrugImages = catchAsync(async (req, res, next) => {
  if (!req.files.images) return next();

  const imagesAray = [];
  await Promise.all(
    req.files.images.map(async (fs, i) => {
      const filename = `drug-${req.insertObj.model}-${Date.now()}-${
        i + 1
      }.jpeg`;
      const bucket = admin.storage().bucket();
      const file = bucket.file(filename);
      const reducedQualityImageBuffer = await sharp(fs.buffer)
        .jpeg({ quality: 90 })
        .toBuffer();
      await file.save(reducedQualityImageBuffer);
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2222",
      });
      imagesAray.push(url);
    })
  );

  req.insertObj.images = imagesAray;
  for (let i = 0; i < imagesAray.length; i++) {
    if (i == 0) {
      req.insertObj.main_image = imagesAray[0];
      await db("drug").where("id", req.drug).update({
        mainImage: imagesAray[0],
      });
    }
    const insertImage = {
      company_id: req.insertObj.company_id,
      drug_id: req.drug,
      image: imagesAray[i],
    };
    await db("drug_images").insert(insertImage);
  }

  req.insertObj.images = imagesAray;

  res.status(201).json({
    message: "posted",
    data: req.insertObj,
  });
});
exports.postDrug = catchAsync(async (req, res, next) => {
  console.log(req.body.name);
  const insertObj = {
    name: req.body.name,
    company_name: req.body.company_name,
    made_in: req.body.made_in,
    discount: req.body.discount,
    expire_date: req.body.expire_date,
    companyId: 1,
    description: req.body.description,
  };
  const drug = await db("drug").insert(insertObj);

  req.drug = drug[0];
  req.insertObj = insertObj;
  req.insertObj.image = req.image;
  next();
});

exports.addBonus = catchAsync(async (req, res, next) => {
  const bonusList = JSON.parse(req.body.bonusList);

  const isValidArray =
    Array.isArray(bonusList) &&
    bonusList.every((elem) => typeof elem === "object");

  if (!isValidArray) {
    next(
      new AppError(
        "Invalid request body: Bonus List must be an array of objects",
        400
      )
    );
  }
  req.insertObj.bonusList = [];
  for await (const singleBonus of bonusList) {
    const bonusId = await db("bonus").insert({
      drug_id: req.drug,
      quantity: singleBonus.quantity,
      bonus: singleBonus.bonus,
    });
    req.insertObj.bonusList.push({
      bonus_id: bonusId[0],
      quantity: singleBonus.quantity,
      bonus: singleBonus.bonus,
    });
  }

  next();
});

exports.getAllDrugs = catchAsync(async (req, res, next) => {
  const drug = await db("drug").select();
  const drugIds = _.map(drug, (drug) => drug.id);
  const bonus = await db("bonus").select().whereIn("drug_id", drugIds);
  const images = await db("drug_images").select().whereIn("drug_id", drugIds);
  const grouppedBonus = _.groupBy(bonus, "drug_id");
  const grouppedImages = _.groupBy(images, "drug_id");

  const result = _.map(drug, (record) => {
    return {
      ...record,
      bonus: grouppedBonus[record.id] ?? [],
      images: grouppedImages[record.id] ?? [],
    };
  });
  res.status(200).json(result);
  next();
});

exports.getOneDrug = catchAsync(async (req, res, next) => {
  const drug = await db("drug").select().where("id", req.params.id).first();
  if (!drug) {
    res.status(404).json("a drug not found");
  }
  const bonus = await db("bonus").select().where("drug_id", "=", drug.id);
  const images = await db("drug_images").select().where("drug_id", drug.id);
  const grouppedImages = _.groupBy(images, "drug_id");
  const grouppedBonus = _.groupBy(bonus, "drug_id");
  const result = {
    drug,
    bonus: grouppedBonus[drug.id] ?? [],
    images: grouppedImages[drug.id] ?? [],
  };
  res.status(200).json({
    result,
  });
  next();
});
exports.deleteDrug = handleFactory.deleteOne("drug");

exports.updateDrug = catchAsync(async (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  const data = await db("drug").where("id", id).update({
    name: body.name,
    made_in: body.made_in,
    discount: body.discount,
    date_time: new Date(),
    expire_date: body.expire_date,
    description: body.description,
  });

  if (!data) {
    return next(new AppError("A drug not updated or not found", 404));
  }

  await db("bonus").delete().where("drug_id", id);
  const bonusList = req.body.bonusList;
  const isValidArray =
    Array.isArray(bonusList) &&
    bonusList.every((elem) => typeof elem === "object");

  if (!isValidArray) {
    next(
      new AppError(
        "Invalid request body: Bonus List must be an array of objects",
        400
      )
    );
  }

  bonusList.map(
    catchAsync(async (singleBonus) => {
      await db("bonus").insert({
        drug_id: id,
        bonus: singleBonus.bonus,
        quantity: singleBonus.quantity,
      });
    })
  );

  res.status(201).json({
    message: "updated",
  });

  next();
});

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const AppError = require("./utils/appError");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin-sdk.json");
const fs = require("fs");
const app = express();
app.enable("trust proxy");
app.use(compression());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "ipharma-5f75f.appspot.com",
});

const drugRoute = require("./routes/drugRoutes");
const pharmacyRoute = require("./routes/pharmacyRoutes");
const companyRoute = require("./routes/companyRoutes");
const authRoute = require("./routes/authRoutes");
const orderRoute = require("./routes/orderRoutes");

// const favouritesRoute = require("./routes/favourite_routes");
// const userRoute = require("./routes/user_routes");
// const ordersRoute = require("./routes/orders_routes");
// const cartRoute = require("./routes/cart_routes");
// const advertiseRoute = require("./routes/advertise_route");

app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());
app.use(helmet());

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });
// app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use("/api/v1/drug", drugRoute);
app.use("/api/v1/pharmacy", pharmacyRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/order", orderRoute);
// app.use("/api/v1/carts", cartRoute);
// app.use("/api/v1/orders", ordersRoute);
// app.use("/api/v1/favourites", favouritesRoute);
// app.use("/api/v1/user", userRoute);
// app.use("/api/v1/advertise",advertiseRoute);

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
//   // console.log("cant find this url");
// });

module.exports = app;

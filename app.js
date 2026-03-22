"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const sequelize = require("./config/db");

// Module routers
const userRouter = require("./modules/user");
const addressRouter = require("./modules/address");
const categoryRouter = require("./modules/category");
const brandRouter = require("./modules/brand");
const productRouter = require("./modules/product");
const productImageRouter = require("./modules/productimage");
const productVariantRouter = require("./modules/productvariant");
const heroSliderRouter = require("./modules/heroslider");
const instagramReelsRouter = require("./modules/instagramreels");
const ordersRouter = require("./modules/orders");
const orderItemsRouter = require("./modules/orderitems");
const wishlistRouter = require("./modules/wishlist");
const reviewsRouter = require("./modules/reviews");
const authRouter = require("./modules/auth");

const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/products", productRouter);
app.use("/api/product-images", productImageRouter);
app.use("/api/product-variants", productVariantRouter);
app.use("/api/hero-sliders", heroSliderRouter);
app.use("/api/instagram-reels", instagramReelsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/order-items", orderItemsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/reviews", reviewsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message || "Internal server error",
  });
});

// Initialize database connection
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (err) {
    const msg = err?.message || err?.code || String(err) || "Unknown error";
    console.error("Unable to connect to the database:", msg);
  }
}

initDatabase();

module.exports = app;


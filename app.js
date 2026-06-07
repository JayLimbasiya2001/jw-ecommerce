"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Module routers
const userRouter = require("./modules/user");
const addressRouter = require("./modules/address");
const categoryRouter = require("./modules/category");
const brandRouter = require("./modules/brand");
const productRouter = require("./modules/product");
const productImageRouter = require("./modules/productimage");
const productVariantRouter = require("./modules/productvariant");
const attributeRouter = require("./modules/attribute");
const attributeValueRouter = require("./modules/attributevalue");
const heroSliderRouter = require("./modules/heroslider");
const instagramReelsRouter = require("./modules/instagramreels");
const ordersRouter = require("./modules/orders");
const orderItemsRouter = require("./modules/orderitems");
const wishlistRouter = require("./modules/wishlist");
const reviewsRouter = require("./modules/reviews");
const blogRouter = require("./modules/blog");
const couponRouter = require("./modules/coupon");
const customerRouter = require("./modules/customer");
const newsletterRouter = require("./modules/newsletter");
const authRouter = require("./modules/auth");
const adminRouter = require("./modules/admin");
const storefrontRouter = require("./modules/storefront");

const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/storefront", storefrontRouter);
app.use("/api/users", userRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/products", productRouter);
app.use("/api/product-images", productImageRouter);
app.use("/api/product-variants", productVariantRouter);
app.use("/api/attributes", attributeRouter);
app.use("/api/attribute-values", attributeValueRouter);
app.use("/api/hero-sliders", heroSliderRouter);
app.use("/api/instagram-reels", instagramReelsRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/customers", customerRouter);
app.use("/api/newsletters", newsletterRouter);
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

module.exports = app;


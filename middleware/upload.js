"use strict";

const path = require("path");
const fs = require("fs");
const multer = require("multer");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createStorage(subDir) {
  const uploadDir = path.join(__dirname, "..", "uploads", subDir);
  ensureDir(uploadDir);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = (file.originalname && path.extname(file.originalname)) || ".jpg";
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = /image\/(jpeg|jpg|png|gif|webp)/i.test(file.mimetype);
  if (allowed) cb(null, true);
  else cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed."), false);
};

// Hero slider upload (image + mobileImage)
const heroSliderStorage = createStorage("heroslider");

const heroSliderUpload = multer({
  storage: heroSliderStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).fields([
  { name: "image", maxCount: 1 },
  { name: "mobileImage", maxCount: 1 },
]);

function heroSliderAttachPaths(req, res, next) {
  if (req.files) {
    if (req.files.image && req.files.image[0]) {
      req.body.image = "/uploads/heroslider/" + req.files.image[0].filename;
    }
    if (req.files.mobileImage && req.files.mobileImage[0]) {
      req.body.mobileImage = "/uploads/heroslider/" + req.files.mobileImage[0].filename;
    }
  }
  next();
}

// Category upload (single image field)
const categoryStorage = createStorage("category");

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

function categoryAttachPath(req, res, next) {
  if (req.file) {
    req.body.image = "/uploads/category/" + req.file.filename;
  }
  next();
}

// Brand upload (single logo field)
const brandStorage = createStorage("brand");

const brandUpload = multer({
  storage: brandStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("logo");

function brandAttachPath(req, res, next) {
  if (req.file) {
    req.body.logo = "/uploads/brand/" + req.file.filename;
  }
  next();
}

// Product variant — optional main image (field name: image)
const productVariantStorage = createStorage("productvariant");
const productVariantUpload = multer({
  storage: productVariantStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

function productVariantAttachPath(req, res, next) {
  if (req.file) {
    req.body.image = "/uploads/productvariant/" + req.file.filename;
  }
  next();
}

// Product / variant gallery: single field `image` OR multiple `images` (same folder)
const productImageStorage = createStorage("productimage");
const MAX_PRODUCT_IMAGES = 25;
const productImageUpload = multer({
  storage: productImageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "image", maxCount: MAX_PRODUCT_IMAGES },
  { name: "images", maxCount: MAX_PRODUCT_IMAGES },
]);

function productImageAttachPaths(req, res, next) {
  const base = "/uploads/productimage/";
  const paths = [];
  if (req.files) {
    if (req.files.image && req.files.image.length) {
      paths.push(...req.files.image.map((f) => base + f.filename));
    }
    if (req.files.images && req.files.images.length) {
      paths.push(...req.files.images.map((f) => base + f.filename));
    }
  }
  if (paths.length) {
    req.body.images = paths;
    req.body.image = paths[0];
  }
  next();
}

// Customer profile image (field name: profileImage)
const customerStorage = createStorage("customer");
const customerUpload = multer({
  storage: customerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profileImage");

function customerAttachPath(req, res, next) {
  if (req.file) {
    req.body.profileImage = "/uploads/customer/" + req.file.filename;
  }
  next();
}

// Newsletter post featured image
const newsletterPostStorage = createStorage("newsletter");
const newsletterPostUpload = multer({
  storage: newsletterPostStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("featuredImage");

function newsletterPostAttachPath(req, res, next) {
  if (req.file) {
    req.body.featuredImage = "/uploads/newsletter/" + req.file.filename;
  }
  next();
}

// Blog featured image (field name: featuredImage)
const blogStorage = createStorage("blog");
const blogUpload = multer({
  storage: blogStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("featuredImage");

function blogAttachPath(req, res, next) {
  if (req.file) {
    req.body.featuredImage = "/uploads/blog/" + req.file.filename;
  }
  next();
}

// Instagram reel thumbnail only (video is a URL in body)
const instagramReelsStorage = createStorage("instagramreels");
const instagramReelsUpload = multer({
  storage: instagramReelsStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("thumbnail");

function instagramReelsAttachPath(req, res, next) {
  if (req.file) {
    req.body.thumbnail = "/uploads/instagramreels/" + req.file.filename;
  }
  next();
}

module.exports = {
  heroSliderUpload,
  heroSliderAttachPaths,
  categoryUpload,
  categoryAttachPath,
  brandUpload,
  brandAttachPath,
  productVariantUpload,
  productVariantAttachPath,
  productImageUpload,
  productImageAttachPaths,
  MAX_PRODUCT_IMAGES,
  customerUpload,
  customerAttachPath,
  newsletterPostUpload,
  newsletterPostAttachPath,
  blogUpload,
  blogAttachPath,
  instagramReelsUpload,
  instagramReelsAttachPath,
};

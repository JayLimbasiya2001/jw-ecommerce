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

module.exports = {
  heroSliderUpload,
  heroSliderAttachPaths,
  categoryUpload,
  categoryAttachPath,
  brandUpload,
  brandAttachPath,
};

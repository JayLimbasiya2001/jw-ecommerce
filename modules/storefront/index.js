"use strict";

const express = require("express");
const { getHome } = require("./home.controller");

const router = express.Router();

router.get("/home", getHome);

module.exports = router;

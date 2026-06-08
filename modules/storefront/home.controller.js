"use strict";

const { buildHomePageData } = require("./home.service");

exports.getHome = async (req, res, next) => {
  try {
    const data = await buildHomePageData();
    res.status(200).json({
      status: 200,
      message: "Home page data fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

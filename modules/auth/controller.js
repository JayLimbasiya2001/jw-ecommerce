"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserService } = require("../user/service");

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone, role } = req.body;

    const existing = await UserService.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        status: "fail",
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserService.create({
      email,
      password: passwordHash,
      name,
      phone,
      role: role || "customer",
      isVerified: false,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      status: "success",
      data: {
        token,
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserService.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      data: {
        token,
        user
      }
    });
  } catch (err) {
    next(err);
  }
};


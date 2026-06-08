"use strict";

const { CartService } = require("./service");
const {
  validateCartLine,
  cartIncludeOptions,
  formatCartItem,
  summarizeCart,
  cartLineWhere,
} = require("./cartLogic");

function customerId(req) {
  return req.user.id;
}

async function findOwnedCartItem(id, req) {
  const row = await CartService.findOne({
    where: { id, customerId: customerId(req) },
    include: cartIncludeOptions(),
  });
  if (!row) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }
  return row;
}

exports.create = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const resolved = await validateCartLine({ productId, variantId, quantity });
    const cid = customerId(req);

    const existing = await CartService.findOne({
      where: cartLineWhere(cid, productId, variantId ?? null),
    });

    let row;
    if (existing) {
      const newQty = existing.quantity + resolved.quantity;
      await validateCartLine({ productId, variantId, quantity: newQty });
      await CartService.update(
        { quantity: newQty },
        { where: { id: existing.id } }
      );
      row = await CartService.findOne({
        where: { id: existing.id },
        include: cartIncludeOptions(),
      });
    } else {
      row = await CartService.create({
        customerId: cid,
        productId,
        variantId: variantId ?? null,
        quantity: resolved.quantity,
      });
      row = await CartService.findOne({
        where: { id: row.id },
        include: cartIncludeOptions(),
      });
    }

    return res.status(201).json({
      status: 201,
      message: existing ? "Cart quantity updated" : "Added to cart",
      data: formatCartItem(row),
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ status: statusCode, message: err.message });
    }
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await CartService.findAndCountAll({
      where: { customerId: customerId(req) },
      include: cartIncludeOptions(),
      order: [["created_at", "DESC"]],
    });
    const items = (result.rows || []).map(formatCartItem);
    const summary = summarizeCart(items);
    return res.status(200).json({
      status: 200,
      message: items.length ? "Cart fetched successfully" : "Cart is empty",
      data: { items, summary },
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const row = await findOwnedCartItem(req.params.id, req);
    return res.status(200).json({
      status: 200,
      data: formatCartItem(row),
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ status: statusCode, message: err.message });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const row = await findOwnedCartItem(req.params.id, req);
    const plain = row.get({ plain: true });
    const quantity = req.body.quantity ?? plain.quantity;

    await validateCartLine({
      productId: plain.productId,
      variantId: plain.variantId,
      quantity,
    });

    await CartService.update({ quantity }, { where: { id: plain.id } });
    const updated = await CartService.findOne({
      where: { id: plain.id },
      include: cartIncludeOptions(),
    });

    return res.status(200).json({
      status: 200,
      message: "Cart item updated",
      data: formatCartItem(updated),
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ status: statusCode, message: err.message });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await findOwnedCartItem(req.params.id, req);
    await CartService.remove({ where: { id: req.params.id } });
    return res.status(200).json({
      status: 200,
      message: "Item removed from cart",
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ status: statusCode, message: err.message });
    }
    next(err);
  }
};

exports.clear = async (req, res, next) => {
  try {
    await CartService.remove({ where: { customerId: customerId(req) } });
    return res.status(200).json({
      status: 200,
      message: "Cart cleared",
    });
  } catch (err) {
    next(err);
  }
};

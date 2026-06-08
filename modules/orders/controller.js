"use strict";

const { getGokwikConfig } = require("../../config/gokwik");
const { updateGokwikOrder } = require("../../services/gokwik/client");
const { OrdersService } = require("./service");
const { placeOrderFromCart } = require("./checkout");
const { cancelOrder } = require("./cancel");
const { parseOrderListQuery } = require("./listQuery");
const { orderIncludeOptions, formatOrder } = require("./ordersLogic");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

function isStaff(req) {
  return req.user?.accountType === "staff";
}

async function findOrderForUser(id, req) {
  const where = { id };
  if (!isStaff(req)) {
    where.customerId = req.user.id;
  }
  const row = await OrdersService.findOne({
    where,
    include: orderIncludeOptions(),
  });
  if (!row) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }
  return row;
}

exports.checkout = async (req, res, next) => {
  try {
    const result = await placeOrderFromCart(req.user.id, req.body);
    const message =
      result.paymentMode === "gokwik"
        ? "Order created — complete payment via GoKwik"
        : "Order placed successfully";

    const data = {
      order: formatOrder(result.order),
    };
    if (result.gokwik) {
      data.gokwik = result.gokwik;
      data.checkout = {
        provider: "gokwik",
        merchantOrderId: String(result.order.id),
        openCheckoutPayload: result.gokwik,
      };
    }

    return res.status(201).json({ status: 201, message, data });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ status: statusCode, message: err.message });
    }
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const isStaffUser = isStaff(req);
    const order = await cancelOrder(req.params.id, {
      customerId: req.user.id,
      isStaff: isStaffUser,
      reason: req.body?.reason,
    });
    return res.status(200).json({
      status: 200,
      message: "Order cancelled successfully",
      data: formatOrder(order),
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
    const customerId = isStaff(req) ? undefined : req.user.id;
    const { where, order, limit, offset, page } = parseOrderListQuery(req.query, {
      customerId,
    });

    const result = await OrdersService.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: orderIncludeOptions(),
      distinct: true,
    });

    const count =
      typeof result?.count === "number"
        ? result.count
        : Array.isArray(result?.count)
          ? result.count.length
          : 0;
    const rows = (result.rows || []).map(formatOrder);

    const body = buildPaginatedResponse(
      { count, rows },
      page,
      limit,
      count === 0 ? "No orders found" : "Orders fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const row = await findOrderForUser(req.params.id, req);
    return res.status(200).json({
      status: 200,
      data: formatOrder(row),
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
    if (!isStaff(req)) {
      return res.status(403).json({
        status: 403,
        message: "Only staff can update order status",
      });
    }

    const id = req.params.id;
    const payload = { ...req.body };
    if (payload.shippingCost != null && payload.shhipingCost == null) {
      payload.shhipingCost = payload.shippingCost;
      delete payload.shippingCost;
    }

    const [affected] = await OrdersService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Order not found" });
    }

    const row = await OrdersService.findOne({
      where: { id },
      include: orderIncludeOptions(),
    });

    const gokwikConfig = getGokwikConfig();
    if (
      gokwikConfig.enabled &&
      row?.paymentMethod === "gokwik" &&
      payload.orderStatus
    ) {
      try {
        await updateGokwikOrder({
          merchant_order_id: String(id),
          order_status: payload.orderStatus,
        });
      } catch (syncErr) {
        console.warn("GoKwik order sync failed:", syncErr.message);
      }
    }

    return res.status(200).json({
      status: 200,
      message: "Order updated successfully",
      data: formatOrder(row),
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!isStaff(req)) {
      return res.status(403).json({
        status: 403,
        message: "Only staff can delete orders",
      });
    }

    const deleted = await OrdersService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Order not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Order deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

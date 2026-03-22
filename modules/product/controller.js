
const { ProductService } = require("./service");
const { sendSuccess, sendFail } = require("../../middleware/response");

exports.create = async (req, res, next) => {
  try {
    const data = await ProductService.create(req.body);
    return sendSuccess(res, 201, data);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await ProductService.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!data) {
      return sendFail(res, 404, "Product not found");
    }
    return sendSuccess(res, 200, data);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [affected] = await ProductService.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!affected) {
      return sendFail(res, 404, "Product not found");
    }
    return sendSuccess(res, 200, { affected });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await ProductService.remove({
      where: {
        id: req.params.id
      },
    });
    if (!deleted) {
      return sendFail(res, 404, "Product not found");
    }
    return sendSuccess(res, 200, null);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await ProductService.findAndCountAll({
      // Implement your query logic here if needed
    });
    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return sendFail(res, 404, "No products found");
    }
    return sendSuccess(res, 200, data);
  } catch (err) {
    next(err);
  }
};

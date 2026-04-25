
const { ProductService } = require("./service");

function buildListResponse(data, page, limit) {
  const totalPages =
    limit > 0 ? Math.max(0, Math.ceil(data.count / limit)) : 0;
  return {
    status: 200,
    message: "Products fetched successfully",
    data: {
      count: data.count,
      currentPage: page,
      totalPages,
      rows: data.rows,
    },
  };
}

exports.create = async (req, res) => {
  try {
    const data = await ProductService.create(req.body);
    return res.status(201).json({
      status: 201,
      message: "Product created successfully",
      data,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      status: statusCode,
      message: err.message || "Internal server error",
      ...(statusCode === 500 && err?.message ? { error: err.message } : {}),
    });
  }
};

exports.get = async (req, res) => {
  try {
    const data = await ProductService.findOneWithDetails(req.params.id);
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [affected] = await ProductService.update(req.body, {
      where: { id },
    });
    if (!affected) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }
    const data = await ProductService.findOneWithDetails(id);
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await ProductService.remove({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset, page } =
      ProductService.parseProductListQuery(req.query);

    const data = await ProductService.findAllWithDetails({
      where,
      limit,
      offset,
      order,
    });

    if (!data || typeof data.count !== "number") {
      return res.status(500).json({
        status: 500,
        message: "Invalid list response",
      });
    }

    const body = buildListResponse(data, page, limit);
    if (data.count === 0) {
      body.message = "No products found";
    }
    return res.status(200).json(body);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err?.message || err,
    });
  }
};

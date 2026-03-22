
const { CategoryService } = require("./service");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

function buildPayload(body, isUpdate = false) {
  const payload = {};

  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.slug !== undefined) payload.slug = String(body.slug).trim();
  if (body.description !== undefined) payload.description = String(body.description);
  if (body.image !== undefined) payload.image = String(body.image).trim();

  const isActive = coerceBool(body.isActive);
  if (isActive !== undefined) payload.isActive = isActive;

  if (body.rank !== undefined) {
    const parsed = parseInt(body.rank, 10);
    if (!Number.isNaN(parsed)) payload.rank = parsed;
  }

  // Defaults for create if missing in form-data
  if (!isUpdate) {
    if (payload.description === undefined) payload.description = "";
    if (payload.isActive === undefined) payload.isActive = true;
    if (payload.rank === undefined) payload.rank = 0;
  }

  return payload;
}

exports.create = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.image) {
      return res.status(400).json({
        status: 400,
        message: "Image is required",
      });
    }
    const data = await CategoryService.create(payload);
    return res.status(201).json({
      status: 201,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err,
    });
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await CategoryService.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!data) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body, true);
    const [affected] = await CategoryService.update(payload, {
      where: {
        id: req.params.id,
      },
    });
    if (!affected) {
      return res.status(404).json({
        status: 404,
        message: "Category not found",
      });
    }
    const data = await CategoryService.findOne({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await CategoryService.remove({
      where: {
        id: req.params.id
      },
    });
    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await CategoryService.findAndCountAll({
      // Implement your query logic here if needed
    });
    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return res.status(404).json({
        status: 404,
        message: "No categories found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Categories fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err,
    });
  }
};


const { BrandService } = require("./service");

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
  if (body.logo !== undefined) payload.logo = String(body.logo).trim();

  const isActive = coerceBool(body.isActive);
  if (isActive !== undefined) payload.isActive = isActive;

  if (body.rank !== undefined) {
    const parsed = parseInt(body.rank, 10);
    if (!Number.isNaN(parsed)) payload.rank = parsed;
  }

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
    if (!payload.logo) {
      return res.status(400).json({
        status: 400,
        message: "Logo is required",
      });
    }
    const data = await BrandService.create(payload);
    return res.status(201).json({
      status: 201,
      data
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
    const data = await BrandService.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: "Brand not found",
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
      error: error,
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body, true);
    const [affected] = await BrandService.update(payload, {
      where: {
        id: req.params.id,
      },
    });
    if (!affected) {
      return res.status(404).json({
        status: 404,
        message: "Brand not found",
      });
    }
    const data = await BrandService.findOne({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json({
      status: 200,
      data
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
    const deleted = await BrandService.remove({
      where: {
        id: req.params.id
      },
    });
    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: "Brand not found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Brand deleted successfully",
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
    const data = await BrandService.findAndCountAll({
      // Implement your query logic here if needed
    });
    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return res.status(404).json({
        status: 404,
        message: "No brands found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Brands fetched successfully",
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

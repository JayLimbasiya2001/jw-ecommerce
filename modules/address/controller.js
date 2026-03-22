
const {AddressService} = require("./service");

exports.create = async (req, res, next) => {
  try {
    const data = await AddressService.create(req.body);
    res.status(201).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await AddressService.get({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await AddressService.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.status(203).send({
      status: "success",
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await AddressService.remove({
      where: {
        id: req.params.id
      },
    });
    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await AddressService.findAndCountAll({
      // Implement your query logic here if needed
    });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

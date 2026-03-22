
const Model = require("./model");

exports.HerosliderService = {
    create: async (data) => {
        return Model.create(data);
    },

    get: async (conditions) => {
        return Model.findAll(conditions);
    },

    findAll: async (condition) => {
        return Model.findAll(condition);
    },

    update: async (data, condition) => {
        return Model.update(data, condition);
    },

    remove: async (condition) => {
        return Model.destroy(condition);
    },
    findAndCountAll: async (condition) => {
        return Model.findAndCountAll(condition);
    },

    count: async (condition) => {
        return Model.count(condition);
    },

    bulkCreate: async (data) => {
        return Model.bulkCreate(data);
    },

    findOne: async (conditions) => {
        return Model.findOne(conditions);
    },
};

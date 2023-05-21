const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/auth');

const customerRoutes = (app) => {
    router.get('/order', auth, customerController.getOrderPage);
    router.get('/order/:id', auth, customerController.getOrderInfoPage);
    return app.use('/customer', router);
};

module.exports = customerRoutes;
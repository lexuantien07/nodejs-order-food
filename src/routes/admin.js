const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

const adminRoutes = (app) => {
    router.get('/order', admin, adminController.orderController);
    router.post('/order/status', admin, adminController.statusController);
    return app.use('/admin', router);
};

module.exports = adminRoutes;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

const adminRoutes = (app) => {
    router.get('/order', admin, adminController.orderController);
    router.get('/add', admin, adminController.getAddItemPage);
    router.post('/post-add', admin, adminController.postAddItem);
    router.post('/edit', admin, adminController.menuController);
    router.post('/post-edit', admin, adminController.postEditItem);
    router.post('/delete', admin, adminController.postDeleteItem);
    router.post('/order/status', admin, adminController.statusController);
    return app.use('/admin', router);
};

module.exports = adminRoutes;
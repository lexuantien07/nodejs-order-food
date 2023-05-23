const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const guest = require('../middlewares/guest');
const auth = require('../middlewares/auth');

const webRoutes = (app) => {
    router.get('/', homeController.getHomePage);

    router.get('/register', guest, homeController.getRegisterPage);
    router.post('/register', homeController.postRegister);

    router.get('/login', guest, homeController.getLoginPage);
    router.post('/login', homeController.postLogin);
    router.post('/logout', homeController.postLogout);

    router.get('/cart', homeController.getCartPage);
    router.get('/checkCart', homeController.getCheckCartPage);
    router.post('/update-cart', homeController.updateCart);

    router.post('/order', auth, homeController.postOrder);

    router.get('/cancel/*', homeController.getCancelPage);
    router.post('/cancel', homeController.postCancel);

    router.get('/food', homeController.getFoodPage);
    router.get('/drink', homeController.getDrinkPage);
    router.get('/dessert', homeController.getDessertPage);
    return app.use('/', router);
};
module.exports = webRoutes;
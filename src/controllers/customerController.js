const Order = require('../models/order');
const moment = require('moment');
const paypal = require('paypal-rest-sdk');

let getOrderPage = async (req, res) => {
    const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } });
    // console.log("Data order: ", orders);
    res.render('customer/order.ejs', {orders: orders, moment: moment});
};

let getOrderInfoPage = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order.customerId.toString() === req.user._id.toString()) {
        return res.render('customer/orderInfo', {order: order});
    }
    return res.redirect('/');
};

module.exports = {
    getOrderPage, getOrderInfoPage
}
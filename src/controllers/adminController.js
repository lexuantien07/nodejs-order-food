const Order = require('../models/order');

let orderController = (req, res) => {
    // Order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } })
    // .populate('customerId', '-password').exec((err, orders) => {
    //     if (req.xhr) {
    //         return res.json(orders);
    //     } else {
    //         return res.render('admin/order');
    //     }
    // })
    Order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } })
    .populate('customerId', '-password').then((orders) => {
        if (req.xhr) {
            return res.json(orders);
        } else {
            return res.render('admin/order');
        }
    }).catch((err) => {
        console.log(err);
    });
};

let statusController = (req, res) => {
    Order.updateOne({ _id: req.body.orderId }, { status: req.body.status })
    .then((data) => {
        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit('orderUpdated', { id: req.body.orderId, 
            status: req.body.status });
        return res.redirect('/admin/order');
    }).catch((err) => {
        console.log(err);
        return res.redirect('/admin/order'); 
    });
};

module.exports = {
    orderController, statusController
}
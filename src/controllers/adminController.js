const Order = require('../models/order');
const Menu = require('../models/menu');

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

let menuController = (req, res) => {
    const itemEdit = JSON.parse(req.body.itemEdit);
    return res.render('admin/edit', { itemEdit: itemEdit });
};

let postEditItem = async (req, res) => {
    console.log('data post: ', req.body);
    console.log('data old: ', JSON.parse(req.body.itemOld));
    const newItem = req.body;
    const oldItem = JSON.parse(req.body.itemOld);
    // console.log('number ', parseInt(newItem.priceEdit));
    const updatedItem = await Menu.findOneAndUpdate({ _id: oldItem._id}, { $set: { name: newItem.nameEdit, 
                                                                            price: parseInt(newItem.priceEdit), 
                                                                            img: newItem.imgValue,
                                                                            category: newItem.categoryEdit } });
    // console.log('data : ', updatedItem);
    // const item = await Menu.findOne({ _id: updatedItem._id });
    // console.log('data after: ', item);
    return res.redirect('/');
};

let getAddItemPage = (req, res) => {
    return res.render('admin/add');
};

let postAddItem = async (req, res) => {
    console.log('data add: ', req.body);
    const { imgAdd, nameAdd, priceAdd, categoryAdd } = req.body;
    if (!imgAdd || !nameAdd || !priceAdd || !categoryAdd) {
        req.flash('error', 'Vui lòng nhập đủ thông tin');
        req.flash('name', nameAdd);
        req.flash('price', priceAdd);
        req.flash('category', categoryAdd);
        return res.redirect('/admin/add');
    }
    const itemExisted = await Menu.exists({ name: nameAdd });
    if (itemExisted) {
        req.flash('error', 'Tên món đã có trong menu');
        return res.redirect('/admin/add');
    }
    const item = new Menu(
        {
            name: nameAdd,
            price: parseInt(priceAdd),
            img: imgAdd,
            category: categoryAdd
        }
    );
    item.save().then((item) => {
        return res.redirect('/');
    }).catch((err) => {
        console.log('Error add item', err);
        return res.redirect('/admin/add');
    })
};

let postDeleteItem = async (req, res) => {
    console.log('data delete: ', JSON.parse(req.body.itemDelete));
    const deleteItem = await Menu.findOneAndDelete({ _id: JSON.parse(req.body.itemDelete)._id });
    console.log('deleted item: ', deleteItem);
    return res.redirect('/');
};

module.exports = {
    orderController, statusController, menuController, postEditItem, getAddItemPage, postAddItem, postDeleteItem
}
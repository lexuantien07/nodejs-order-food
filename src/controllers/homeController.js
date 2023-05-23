const Menu = require('../models/menu');
const User = require('../models/user');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { json } = require("express");
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});

const _getDirectedURL = (req) => {
    return req.user.role === 'admin' ? '/admin/order' : '/customer/order';
};

let getHomePage = async (req, res) => {
    const favorites = await Menu.find();
    console.error();
    res.render('home', { data: favorites });
};

let getRegisterPage = (req, res) => {
    res.render('auth/register');
};

let postRegister = async (req, res) => {
    console.log(req.body);
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        req.flash('error', 'Vui lòng điền đủ thông tin');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
    }

    //check existing email
    const doesUserExit = await User.exists({ email: email });
    if (doesUserExit) {
        req.flash('error', 'Email đã được sử dụng');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
    }
    // User.exists({ email: email }, (err, result) => {
    //     if (result) {
    //         req.flash('error', 'Email đã được sử dụng');
    //         req.flash('name', name);
    //         req.flash('email', email);
    //         return res.redirect('/register');
    //     }
    // })


    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //create a new user
    const user = new User(
        {
            name: name,
            email: email,
            password: hashedPassword
        }
    )

    user.save().then((user) => {
        return res.redirect('/');
    }).catch(err => {
        req.flash('error', 'Đã xảy ra lỗi! Xin Vui lòng nhập lại');
        return res.redirect('/register');
    })

};

let getLoginPage = (req, res) => {
    res.render('auth/login');
};

let postLogin = (req, res, next) => {
    console.log(req.body);
    const {email, password} = req.body;
    if (!email || !password) {
        req.flash('error', 'Vui lòng điền đủ thông tin');
        req.flash('email', email);
        return res.redirect('/login');
    }
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            req.flash('error', info.message);
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash('error', info.message);
                return next(err);
            }
            return res.redirect(_getDirectedURL(req));
        })
    })(req, res, next)
};

let postLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        return res.redirect('/login');
    });
};

let getCartPage = (req, res) => {
    res.render('customer/cart.ejs');
};

let getCheckCartPage = (req, res) => {
    res.render('customer/checkCart');
};

let updateCart = (req, res) => {
    if (!req.session.cart) {
        req.session.cart = {
            items: {},
            totalQuantity: 0,
            totalPrice: 0,
        }
    }
    
    let cart = req.session.cart;
    console.log("body data", req.body);

    if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
            item: req.body,
            quantity: 1,
        }
        cart.totalQuantity += 1;
        cart.totalPrice += parseInt(req.body.price);
    } else {
        cart.items[req.body._id].quantity += 1;
        cart.totalQuantity += 1;
        cart.totalPrice += parseInt(req.body.price);
    }
    return res.json({ totalQuantity: req.session.cart.totalQuantity });
};

let postOrder = async (req, res) => {
    console.log('body data: ', req.body);
    const { phone, address, payType } = req.body;
    if (!phone || !address) {
        req.flash('error', 'Vui lòng nhập đủ thông tin');
        return res.redirect('/cart');
    }

    const user = await User.findById(req.user._id).exec();

    if (payType === 'paypal') {
        const order = new Order({
            customerId: req.user._id,
            items: req.session.cart.items,
            phone: phone,
            address: address,
            paymentStatus: true,
            paymentType: "Paypal"
        });
        order.save().then(result => {
            Order.populate(result, { path: 'customerId' })
            .then((placedOrder) => {
                req.flash('success', 'Đặt hàng thành công');
                // console.log('data cart', Object.values(req.session.cart.items));
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', placedOrder);
                let data = [];
                let total = 0;
                for (let i = 0; i < Object.values(req.session.cart.items).length; i++) {
                    // let item = Object.values(req.session.cart.items)[i].item;
                    total 
                    let item = {
                            "name": Object.values(req.session.cart.items)[i].item.name,
                            "sku": Object.values(req.session.cart.items)[i].item._id,
                            "price": Object.values(req.session.cart.items)[i].item.price,
                            "currency": "USD",
                            "quantity": Object.values(req.session.cart.items)[i].quantity
                    }
                    data.push(item);
                }
                // console.log('data user: ', req.user);
                // console.log('data user: ', user);
                // Object.values(req.session.cart.items)
                // console.log('data array: ', data);
                const create_payment_json = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "https://nodejs-order-food.onrender.com/customer/order",
                        "cancel_url": "https://nodejs-order-food.onrender.com/cancel/*"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": data,
                            "shipping_address": {
                                "recipient_name": user.name,
                                "line1": address,
                                "city": "HCM",
                                "country_code": "VN",
                                "postal_code": "70000",
                                "phone": phone,
                                "state": " "
                            }
                        },
                        "amount": {
                            "currency": "USD",
                            "total": req.session.cart.totalPrice
                        },
                        "description": '`${names}`'
                    }]
                };
        
                delete req.session.cart;
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        throw error;
                    } else {
                        for (let i = 0; i < payment.links.length; i++) {
                            if (payment.links[i].rel === 'approval_url') {
                                // console.log("Create Payment Response");
                                // console.log(payment);
                                res.redirect(payment.links[i].href);
                            }
                        }
                    }
                });
                //return res.redirect('/customer/order');
            })
            .catch((err) => {
                console.log(err);
            });

        }).catch(err => {
            req.flash('error', 'Đã xảy ra lỗi! Vui lòng thực hiện lại');
            return res.redirect('/cart');
        })

    } else {
        const order = new Order({
            customerId: req.user._id,
            items: req.session.cart.items,
            phone: phone,
            address: address,
            paymentType: "COD"
        });

        order.save().then(result => {
            Order.populate(result, { path: 'customerId' })
            .then((placedOrder) => {
                req.flash('success', 'Đặt hàng thành công');
                console.log('data cart', Object.values(req.session.cart.items));
                delete req.session.cart;
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', placedOrder);
                return res.redirect('/customer/order');
            })
            .catch((err) => {
                console.log(err);
            });

        }).catch(err => {
            req.flash('error', 'Đã xảy ra lỗi! Vui lòng thực hiện lại');
            return res.redirect('/cart');
        })
    }
};

let getCancelPage = (req, res) => {
    return res.render('cancel');
};

let postCancel = async (req, res) => {
    if (req.body.cancel === 'cancel') {
        req.flash('cancel', 'Bạn đã huỷ đơn hàng');
        const deletedItem = await Order.findOneAndDelete({customerId: req.user._id}, { sort: { 'createdAt': -1 } });
        console.log("Data deleted: ", deletedItem);
    }
    return res.redirect('/customer/order');
};

let getFoodPage = async (req, res) => {
    const foods = await Menu.find({ category: 'food' });
    return res.render('food.ejs', { data: foods });
};

let getDrinkPage = async (req, res) => {
    const drinks = await Menu.find({ category: 'drink' });
    return res.render('drink.ejs', { data: drinks });
};

let getDessertPage = async (req, res) => {
    const desserts = await Menu.find({ category: 'dessert' });
    return res.render('dessert.ejs', { data: desserts });
};
module.exports = {
    getHomePage,
    getRegisterPage, getLoginPage, 
    getCartPage, getCheckCartPage, updateCart,
    postRegister, postLogin, postLogout, 
    postOrder, 
    getCancelPage, postCancel,
    getFoodPage, getDrinkPage, getDessertPage,
}
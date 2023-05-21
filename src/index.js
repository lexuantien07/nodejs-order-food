// init app
const express = require('express');
const path = require('path');
require('dotenv').config();
const expressLayout = require('express-ejs-layouts');
// routes
const customerRoutes = require('./routes/customer');
const webRoutes = require('./routes/web');
const adminRoutes = require('./routes//admin');
// database and session
const mongoose = require("mongoose");
const connectDb = require('./config/connectDb');
const session = require('express-session');
const flash = require('express-flash');
const mongodbStore = require('connect-mongo')(session);
// passport
const passport = require('passport');
const InitPassport = require('./config/passport');
//
const Emitter = require('events');

const app = express();
//mongodb://localhost/pizza

mongoose.connect(process.env.CONNECTION_STRING);
const connection = mongoose.connection;
connection
.once('open', () => {
    console.log('Database connected...');
})
.on('error', (err) => {
    console.log('Connection failed...')
});
let mongoStore = new mongodbStore({
    mongooseConnection: connection,
    collection: 'sessions'
});

//
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

//session
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}));
app.use(flash());

//passport
InitPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

//
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
});

// set assets
app.use(express.static(path.join(__dirname, 'public')));

//
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set view engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//routes
customerRoutes(app);
webRoutes(app);
adminRoutes(app);
app.use((req, res) => {
    res.status(404).render('notfound');
})
const port = process.env.PORT || 3031;
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

//socket.io

const io = require('socket.io')(server);
io.on('connection', (socket) => {
    socket.on('join', (orderId) => {
        socket.join(orderId);
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', (data) => {
    io.to('admin').emit('orderPlaced', data);
});
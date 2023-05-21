const mongoose = require("mongoose");
const session = require('express-session');
const mongodbStore = require('connect-mongo')(session);
const flash = require('express-flash');

const connectDb = async (app) => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      "Database connected: ",
      connect.connection.host,
      connect.connection.name
    );
        //
    let mongoStore = new mongodbStore({
        mongooseConnection: connect.connection,
        collection: 'sessions'
    });

    //session
    app.use(session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        store: mongoStore,
        saveUninitialized: false,
        cookie: {maxAge: 1000 * 60 * 60 * 24}
    }));
    app.use(flash());
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDb;
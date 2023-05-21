const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

function InitPassport (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email'}, async (email, password, done) => {
        //check email
        const user = await User.findOne({email: email});
        if (!user) {
            return done(null, false, { message: 'Email chưa được đăng ký' });
        }
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                return done(null, user, { message: 'Đăng nhập thành công' });
            }
            return done(null, false, { message: 'Sai mật khẩu' });
        }).catch(err => {
            return done(null, false, { message: 'Đã xảy ra lỗi! Vui lòng đăng nhập lại' });
        })
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id).exec();
        return done(null, user);
    })
}

module.exports = InitPassport;
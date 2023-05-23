const mongoose = require('mongoose');

const menuSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        img: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Favorites", menuSchema);
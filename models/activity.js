const mongoose = require("mongoose");

const ActivitySchema = mongoose.Schema({
    user_id : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Activity', ActivitySchema);
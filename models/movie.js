const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title: String,
    image: String,
    description: String,
    genre: String,
    date: Number,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

module.exports = mongoose.model('Movie', MovieSchema)
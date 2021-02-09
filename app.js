const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const Movie = require('./models/movie')
const Review = require('./models/review');

const dbUrl ='mongodb+srv://admin:46vQQPkwcdfaSXL@cluster0.iv83p.mongodb.net/cluster0?retryWrites=true&w=majority'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// mongoose.connect('mongodb://localhost:27017/movie-db', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

app.get('/' , async (req, res) => {
    res.render('home');
})

app.get('/movies/new', (req, res) => {
    res.render('movies/new');
})

app.post('/movies', async (req, res) => {
    const movie = new Movie(req.body.movie);
    await movie.save();
    res.redirect(`/movies/${movie._id}`);
})

app.get('/movies/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id).populate('reviews');
    res.render('movies/show', { movie })
})

app.get('/movies/:id/edit', async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render('movies/edit', { movie });
})

app.put('/movies/:id', async(req, res) => {
    const { id } = req.params;
    const movie = await Movie.findByIdAndUpdate(id,{ ... req.body.movie})
    res.redirect(`/movies/${movie._id}`);
})

app.get('/allmovies', async (req, res) => {
    const movies = await Movie.find({});
    res.render('movies/index', {movies});
})

app.post('/movies/:id/reviews', (async(req, res) => {
    const movie = await Movie.findById(req.params.id)
    const review = new Review(req.body.review);
    movie.reviews.push(review)
    await review.save()
    await movie.save()
    res.redirect(`/movies/${movie._id}`);
}))

app.delete('/movies/:id', async(req, res) => {
    const {id} = req.params;
    await Movie.findByIdAndDelete(id)
    res.redirect('/allmovies');
})

app.delete('/movies/:id/reviews/:reviewId', async(req, res) => {
    const { id, reviewId } = req.params
    await Movie.findByIdAndUpdate(id, { $pull: { reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/movies/${id}`);
})

app.get('/*', (req, res) => {
    res.send('404 Error: Page Not Found')
})

const port = process.env.PORT || 80
// port 3000
app.listen(port, () => {
    console.log('serving on port');
})
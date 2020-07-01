//jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

var results_movie = [];
var movie_posters = [];
var overview = [];
var avg_rating= [];
const nullimg_url = 'images/null.png';

app.get('/', (req, res) =>
{
    res.render('home.ejs');
});

app.get('/about', (req, res) =>
{
    res.render('about.ejs');
});

app.get('/contact', (req, res) =>
{
    res.render('contact.ejs');
});

app.post('/results.ejs', (req, res) => 
{
    movie_posters = [];
    results_movie = [];
    overview = [];
    avg_rating= [];
    const m_name = req.body.moviename;
    const api_key = '51890a1c9ebe74b155af180ae9766879';
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${m_name}`;
    const config_url = `https://api.themoviedb.org/3/configuration?api_key=${api_key}`;
    https.get(url, (response) =>
    {
        console.log(response.statusCode);

        response.on("data", (data) =>
        {
            const movie_data = JSON.parse(data);
            console.log(movie_data);
            for(var i = 0; i < movie_data.results.length; i++)
            {
                results_movie.push(movie_data.results[i].title);
                overview.push(movie_data.results[i].overview);
                avg_rating.push(movie_data.results[i].vote_average);
            }
            https.get(config_url, (response) =>
            {
                console.log(response.statusCode);

                response.on("data", (data) =>
                {
                    const config_data = JSON.parse(data);
                    for(var i = 0; i < movie_data.results.length; i++)
                    {
                        if(movie_data.results[i].poster_path != null)
                            movie_posters.push(`${config_data.images.secure_base_url}${config_data.images.poster_sizes[2]}${movie_data.results[i].poster_path}`);
                        
                        else
                            movie_posters.push(`${nullimg_url}`);
                    }
                    console.log(movie_posters);
                    res.render('results.ejs', {
                    results: results_movie,
                    movie_url: movie_posters,
                    query: m_name,
                    description: overview,
                    rating: avg_rating
                    })
                })
            
            })
        })
    })
    
});

let port = process.env.PORT;
if(port == null || port == "")
{
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});


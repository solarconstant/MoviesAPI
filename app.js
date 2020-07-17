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
var id = [];
var overview = [];
var backdrop = [];
var release = [];
var avg_rating = [];
var genres = [];
var genres_name = [];
var genre_list = [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 14,
      "name": "Fantasy"
    },
    {
      "id": 36,
      "name": "History"
    },
    {
      "id": 27,
      "name": "Horror"
    },
    {
      "id": 10402,
      "name": "Music"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10749,
      "name": "Romance"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    },
    {
      "id": 10770,
      "name": "TV Movie"
    },
    {
      "id": 53,
      "name": "Thriller"
    },
    {
      "id": 10752,
      "name": "War"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]

const nullimg_url = '/images/null.png';

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

app.get('/register', (req, res) =>
{
    res.render('register.ejs')
});

app.post('/results.ejs', (req, res) => 
{
    movie_posters = [];
    results_movie = [];
    backdrop = [];
    overview = [];
    avg_rating= [];
    release = [];
    
    const m_name = req.body.moviename;
    const api_key = process.env.APIKEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${m_name}`;
    const config_url = `https://api.themoviedb.org/3/configuration?api_key=${api_key}`;

    https.get(url, (response) =>
    {
        console.log(response.statusCode);

        response.on("data", (data) =>
        {
            const movie_data = JSON.parse(data);
            //console.log(movie_data);
            for(var i = 0; i < movie_data.results.length; i++)
            {
                var movie_genre = [];
                results_movie.push(movie_data.results[i].title);
                overview.push(movie_data.results[i].overview);
                avg_rating.push(movie_data.results[i].vote_average);
                id.push(movie_data.results[i].id);
                (movie_data.results[i].release_date != null)?(release.push(movie_data.results[i].release_date.slice(0, 4))):(release.push(""));
                genres.push(movie_data.results[i].genre_ids);
                for(var j = 0; j < movie_data.results[i].genre_ids.length; j++)
                {
                  for(var k = 0; k < genre_list.length; k++)
                  {
                    if(movie_data.results[i].genre_ids[j] == genre_list[k]["id"])
                    {
                      movie_genre.push(genre_list[k]["name"]);
                    }
                  }
                }
                genres_name.push(movie_genre);
              }
            //console.log(genres_name);
            https.get(config_url, (response) =>
            {
                console.log(response.statusCode);

                response.on("data", (data) =>
                {
                    const config_data = JSON.parse(data);
                    for(var i = 0; i < movie_data.results.length; i++)
                    {
                        if(movie_data.results[i].poster_path != null)
                        {
                            movie_posters.push(`${config_data.images.secure_base_url}${config_data.images.poster_sizes[2]}${movie_data.results[i].poster_path}`);
                            backdrop.push(`${config_data.images.secure_base_url}${config_data.images.backdrop_sizes[2]}${movie_data.results[i].backdrop_path}`);
                        }
                        else
                        {
                            movie_posters.push(`${nullimg_url}`);
                            backdrop.push(`${nullimg_url}`);
                        }
                    }
                    res.render('results.ejs', {
                    results: results_movie,
                    movie_url: movie_posters,
                    query: m_name,
                    description: overview,
                    rating: avg_rating,
                    id: id
                    })
                })
            
            })
        })
    })
    
});

app.get('/results/:movieid', (req, res) => 
{
    var movieid = req.params.movieid;
    function getIndexOf(element, array)
    {
        for (var i = 0; i < array.length; i++)
        {
            if(array[i] == element)
            {
                return i;
            }
        }
        return -1;
    }
    index = getIndexOf(movieid, id);

    //console.log(genres);
    res.render('moviepage.ejs', {
        moviename: results_movie[index],
        movie_poster: movie_posters[index],
        backdrop: backdrop[index],
        description: overview[index],
        year: release[index],
        genres : genres_name[index],
        rating: avg_rating[index]
    });
});

let port = process.env.PORT;
if(port == null || port == "")
{
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});


'use strict';
//requires 
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const cors = require('cors');

// main variables 
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 4000; 

// uses 
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//=====(Routes)======\\

app.get('/',homePageHandler);
app.get('/addToFav',addToFavHandler);
app.get('/favoriteJokes',favoriteJokesHandler);
app.get('/details/:joke_id',detailsHandler);
app.get('/randomJoke',randomJokeHandler);
app.put('/updateTheJoke/:uId',updateTheJokeHandler);
app.delete('/delete/:dId',deleteHandler);


//=====(Routes Handlers)======\\

function homePageHandler(req,res){
 let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';
 superagent.get(url).then(data=>{
     let jokesArry=data.body.map(res=>{
         return new Joke(res);
     })
     res.render('index',{data:jokesArry});
 })

}
function Joke(res){
    this.type=res.type;
    this.setup = res.setup;
    this.punchline=res.punchline;
}

// Add a joke to your favorite list 

  function addToFavHandler(req,res){
      let {type,setup,punchline} = req.query;
      let SQL ='INSERT INTO laugh (type,setup,punchline) VALUES ($1,$2,$3);';
      let safevalues= [type,setup,punchline];
      client.query(SQL,safevalues).then(()=>{
          res.redirect('/favoriteJokes');
      })
  }
// Show the jokes you slected as you fav in a list from database

function favoriteJokesHandler(req,res){
    let SQL='SELECT * FROM laugh';
    client.query(SQL).then(val=>{
           if(val.rows.length === 0){
            res.render('./pages/noFavJokes');
           } else{
             res.render('./pages/favorites',{data:val.rows})
           }
    })
}

// Show More Information About a joke you like 

function detailsHandler(req,res){
    let id = req.params.joke_id;
    let SQL = 'SELECT * FROM laugh WHERE id=$1;';
    let safevalues = [id];
    client.query(SQL,safevalues).then(val=>{
        res.render('./pages/details',{data:val.rows[0]})
    })
}


// Make changes on the joke you wanted to view its details
function updateTheJokeHandler(req,res){
    let id = req.params.uId;
    let {type,setup,punchline} =req.body;
    let SQL = 'UPDATE laugh SET type=$1,setup=$2,punchline=$3 WHERE id=$4';
    let safevalues = [type,setup,punchline,id];
    client.query(SQL,safevalues).then(()=>{
        res.redirect(`/details/${id}`);
    })

}

  // delete a joke from the list if you dont like it anymore 

 function deleteHandler(req,res){
     let id = req.params.dId;
     let SQL = 'DELETE FROM laugh WHERE id=$1;';
     let safevalues =[id];
     client.query(SQL,safevalues).then(()=>{
         res.redirect('/favoriteJokes');
     })
    
    }


// A place where u get a random joke very time u get into 

function randomJokeHandler(req,res){
   let url='https://official-joke-api.appspot.com/jokes/programming/random';
   superagent.get(url).then(data=>{
       let randomArry = data.body.map(result=>{
           return new Joke(result);
       })
       res.render('./pages/random',{data:randomArry})
   })

}


// start the app 
client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`up and running on ${PORT}`);
    })
})
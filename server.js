/*
Project name: Cyber City Comics
Author: Junwoo Lee
Date: 10/18/2021
Heroku url: https://safe-coast-93030.herokuapp.com
*/


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var layouts = require('express-ejs-layouts');
var got = require('got');
var path = require("path");

// view engine setup
app.use(layouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

//initialize with lastest Cartoon
var latestCartoonAPI = "https://xkcd.com/info.0.json";
var latestCartoonJSON;
var views;
got.get(latestCartoonAPI, { responseType: 'json' })
    .then(result => {
        latestCartoonJSON = result.body;
    }).then(() => {
        views = new Array(latestCartoonJSON.num).fill(0);
    }).then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    }).catch(err => {
        console.log('Error: ', err.message);
    })

// setup homepage
app.get("/", function (req, res) {
    views[views.length-1]+=1;
    res.render('cartoon', { cartoon: latestCartoonJSON, maxnum: latestCartoonJSON.num, view: views[views.length-1]});
});

//implementation of random button
app.get("/random", function (req, res) {
    var randNum = Math.floor(Math.random() * latestCartoonJSON.num + 1);
    res.redirect("/" + randNum);
});

app.get("/:cartoonNum", function (req, res) {
    if(req.params.cartoonNum=='favicon.ico');
    else if (req.params.cartoonNum > latestCartoonJSON.num || req.params.cartoonNum < 1) {
        res.status(404).send("Page Not Found");
    }
    else {
        var url = "https://xkcd.com/" + req.params.cartoonNum + "/info.0.json";
        got.get(url, { responseType: 'json' })
            .then(result => {
                views[req.params.cartoonNum-1] += 1;
                var cartoon = result.body;
                cartoon.transcript = cartoon.transcript.replace(/\n/gi,'<br>');
                cartoon.transcript = cartoon.transcript.replace(/<</gi,'&lt;&lt;');
                res.render('cartoon', { cartoon: cartoon, maxnum: latestCartoonJSON.num, view: views[req.params.cartoonNum-1]});
            }).catch(err => {
                console.log('Error:assa ', err.message);
            })
    }
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

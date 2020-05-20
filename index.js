// all you need to do in the terminal is: npm install
// the above command will install what is in packages.json
// to run this file, in the terminal type: npm start
// unless your nodemon doesn't work, then you will need to type: node index.js
////////////////////////////////////////////////////////

const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');
const dotenv = require('dotenv').config(); 

const PORT = process.env.PORT || 3000;
const app = express();
// Set the View Engine
app.set('view engine', 'ejs');

// Use body Parser in middle-ware
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

let db_handler;
// const DB_URL = 'mongodb://localhost:27017';
const DB_URL = process.env.DB_URL; 
const DB_NAME = process.env.DB_NAME; 
const COLLECTION_NAME = 'candy';

app.listen(PORT, () => {
    console.log(`Server Started on Port: ${PORT}`);

    let mongo_client = mongodb.MongoClient;
    mongo_client.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db_client) => {
        if (err) {
            console.log("Error: " + err);
        }
        else {
            console.log("Database Connected");
            db_handler = db_client.db(DB_NAME);
        }
    });
});

// From here on, we can start writing our routes

app.get('/', (req, res) => {

    db_handler.collection(COLLECTION_NAME).find({}).toArray((err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            // console.log(result);
            res.render('index', {
                'all_candies': result
            });
        }
    });
});

app.get('/view/:candy_name', (req, res) => {
    const parameters = req.params;
    const c_name = parameters['candy_name'];
    // A better way to do the following is using findOne method. 
    // You can find information here https://www.w3schools.com/nodejs/nodejs_mongodb_find.asp
    db_handler.collection(COLLECTION_NAME).find({ name: c_name }).toArray((err, result) => {
        if (err) {
            res.send("Candy not found");
            console.log(err);
        }
        else {
            res.render('candy', {
                'single_candy': result[0]
            });
        }
    });
});

app.get('/updateRating/:candy_name', (req, res) => {
    const parameters = req.params;
    const c_name = parameters['candy_name'];

    const new_values = { $set: { rating: 10 } };
    db_handler.collection(COLLECTION_NAME).updateOne({ name: c_name }, new_values, (err, result) => {
        if (err) {
            res.send("Could not update the rating");
            console.log(err);
        }
        else {
            res.redirect('/view/' + c_name);
        }
    });
});

app.get('/delete/:candy_name', (req, res) => {
    const parameters = req.params;
    const c_name = parameters['candy_name'];
    db_handler.collection(COLLECTION_NAME).deleteOne({ name: c_name }, (err, result) => {
        if (err) {
            res.send("Could not delete the candy");
            console.log(err);
        }
        else {
            res.redirect('/');
        }

    });
});

app.post('/add', (req, res) => {
    // Do something here with your request body
    const form_data = req.body;
    console.log(form_data);
    const name = form_data['name'];
    const rating = parseInt(form_data['rating']);

    const my_object = {
        name: name,
        rating: rating
    }

    db_handler.collection(COLLECTION_NAME).insertOne(my_object, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        }
        else {
            console.log("One Entry Added");
            res.redirect('/');
        }
    });
});
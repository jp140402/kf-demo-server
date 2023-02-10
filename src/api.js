const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
import express, { Router } from "express";
import { urlencoded, json } from "body-parser";
import axios from 'axios';
import cors from 'cors';
import serverless from 'serverless-http';
const app = express();
const router = Router();
app.use(urlencoded({extended: true}));
app.use(cors());
app.use(json());

function queryData(queryType, updateValue, clientId){
    var data = {
      "collection": "demoCL",
      "database": "demoDB",
      "dataSource": "Cluster0",
  }
  if(updateValue){
    data.filter = { "_id": { "$oid": `${clientId}` } }
    data.update = { "$set": {"details": updateValue} }
  }
    var config = {
        method: 'post',
        url: `https://data.mongodb-api.com/app/${process.env.APP_ID}/endpoint/data/v1/action/${queryType}`,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': `${process.env.API_KEY}`,
        },
        data: data
    };
    return config
}

router.get("/", function(req, res) {
    axios(queryData('find'))
    .then(function (response){
        res.json(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });
})

router.post("/update", function(req, res) {
  const updateBody = req.body
  const clientId = req.headers['clientid']
  axios(queryData('updateOne', updateBody, clientId))
  .then(function (response){
      res.json(response.data);
  })
  .catch(function (error){
      console.log(error);
  });
})
app.use('/.netlify/functions/api', router)

export const handler = serverless(app)
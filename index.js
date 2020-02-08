require('dotenv').config()

const cors = require('cors');
const express = require('express');
const app = express();
const SquareConnect = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;

app.use(cors());
app.options('*', cors());

// SANDBOX URL! DELETE FOR PRODUCTION!
defaultClient.basePath = 'https://connect.squareupsandbox.com';

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env.ACCESS_TOKEN;

const apiInstance = new SquareConnect.CatalogApi();

const opts = {
  'cursor': "",
  'types': "ITEM,IMAGE"
};

app.get('/', (req, res) => {
  apiInstance.listCatalog(opts).then(function (data) {
    res.send(data);
  }, function (error) {
    console.error(error);
  });
});

app.listen(8000, () => {
  console.log('Example app listening on port 8000!');
});

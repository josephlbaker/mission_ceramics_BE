// require('dotenv').config({ path: __dirname + '/.env' })
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

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env.ACCESS_TOKEN;

const api = new SquareConnect.LocationsApi();

api.listLocations().then(function (data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data, 0, 1));
}, function (error) {
  console.error(error);
});

const apiInstance = new SquareConnect.CatalogApi();

const opts = {
  'cursor': "", // String | The pagination cursor returned in the previous response. Leave unset for an initial request. See [Pagination](https://developer.squareup.com/docs/basics/api101/pagination) for more information.
  'types': "ITEM,IMAGE" // String | An optional case-insensitive, comma-separated list of object types to retrieve, for example `ITEM,ITEM_VARIATION,CATEGORY,IMAGE`.  The legal values are taken from the CatalogObjectType enum: `ITEM`, `ITEM_VARIATION`, `CATEGORY`, `DISCOUNT`, `TAX`, `MODIFIER`, `MODIFIER_LIST`, or `IMAGE`.
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

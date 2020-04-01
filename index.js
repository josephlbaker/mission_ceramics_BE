require('dotenv').config()

const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const express = require('express');
const app = express();
const SquareConnect = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(cors());
app.options('*', cors());

// SANDBOX URL! DELETE FOR PRODUCTION!
defaultClient.basePath = 'https://connect.squareupsandbox.com';

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env.ACCESS_TOKEN;

// RETRIEVING ITEMS IN CATALOG

const catalog = new SquareConnect.CatalogApi();

const opts = {
  'cursor': "",
  'types': "ITEM,IMAGE"
};

app.get('/', (req, res) => {
  catalog.listCatalog(opts).then(function (data) {
    res.send(data);
  }, function (error) {
    console.error(error);
  });
});

app.post('/payments', async (req, res) => {
  const request_params = req.body;

  // length of idempotency_key should be less than 45
  const idempotency_key = crypto.randomBytes(22).toString('hex');

  // Charge the customer's card
  const payments_api = new SquareConnect.PaymentsApi();
  const request_body = {
    source_id: request_params.nonce,
    amount_money: {
      amount: request_params.amount, // $1.00 charge
      currency: 'USD'
    },
    idempotency_key: idempotency_key
  };

  try {
    const response = await payments_api.createPayment(request_body);
    res.status(200).json({
      'title': 'Payment Successful',
      'result': response
    });
  } catch (error) {
    res.status(500).json({
      'title': 'Payment Failure',
      'result': error.response.text
    });
  }
});





app.listen(8000, () => {
  console.log('Example app listening on port 8000!');
});

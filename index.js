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

const orders_api = new SquareConnect.OrdersApi();
const payments_api = new SquareConnect.PaymentsApi();
const locations_api = new SquareConnect.LocationsApi();
const catalog_api = new SquareConnect.CatalogApi();
const customers_api = new SquareConnect.CustomersApi();
const checkout_api = new SquareConnect.CheckoutApi();

const locationId = process.env.LOCATION_ID; // String | The ID of the business location to associate the order with.

// CHECKOUT

app.post("/checkout", (req, res) => {
  const body = req.body; // CreateCheckoutRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.

  checkout_api.createCheckout(locationId, body).then(function (data) {
    console.log('CHECKOUT API called successfully. Returned data: ' + JSON.stringify(data));
    res.send(data);
  }, function (error) {
    console.error(error);
  });
})

// CUSTOMERS

app.get("/customers", (req, res) => {
  customers_api.listCustomers().then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  }, function (error) {
    console.error(error);
  });
})

app.post("/create-customer", (req, res) => {
  const body = req.body;
  customers_api.createCustomer(body).then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    // return (JSON.stringify(data));
    res.send(data);
  }, function (error) {
    console.error(error);
  });
})

// ORDERS

app.post("/orders", (req, res) => {
  // var body = new SquareConnect.CreateOrderRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
  const body = req.body;
  orders_api.createOrder(locationId, body).then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    res.send(data);
  }, function (error) {
    console.error(error);
  });
})

app.post("/search-orders", (req, res) => {
  // var body = new SquareConnect.SearchOrdersRequest(); // SearchOrdersRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
  const body = req.body;
  orders_api.searchOrders(body).then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  }, function (error) {
    console.error(error);
  });
})


// RETRIEVING ITEMS IN CATALOG

// app.get("/", async (req, res, next) => {
//   // Set to retrieve ITEM and IMAGE CatalogObjects
//   const opt = {
//     types: "ITEM,IMAGE" // To retrieve TAX or CATEGORY objects add them to types
//   };

//   try {
//     // Retrieves locations and in order to display the store name
//     const { locations } = await locations_api.listLocations();
//     // Get CatalogItem and CatalogImage object
//     const catalogList = await catalog_api.listCatalog(opt);
//     // Organizes Catalog List into class IndexPageData
//     const viewData = new IndexPageData(catalogList, locations[0]); // One location for the sake of simplicity.
//     // Renders index view, with catalog information
//     res.render("index", viewData);
//   } catch (error) {
//     next(error);
//   }
// });

app.get('/api', (req, res) => {
  const catalog = new SquareConnect.CatalogApi();

  const opts = {
    'cursor': "",
    'types': "ITEM,IMAGE"
  };

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
    verification_token: request_params.token,
    amount_money: {
      amount: request_params.amount, // $1.00 charge
      currency: 'USD'
    },
    idempotency_key: idempotency_key,
    note: request_params.note,
    order_id: request_params.orderId
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

const express = require("express");
const router = express.Router();
const paypal = require('paypal-rest-sdk');


paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'AaGdQcF1ABW2yqio7USyNjvEEWNVG5QmU6eM47Ue-uckigTQprkxMPl2nJH1K-QyjrfsdNu8T1dYdc8g',
  'client_secret': 'EMTmCkUxNxRO_NUk3_ZsqyxgcP7HSxWbXvKyqsvbN4y3jN5q0ukZOB3YWvv37FvE0-1sUiGWdJ8hPks0'
});

router.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://www.victoriatelfer.com/pay/success",
        "cancel_url": "http://www.victoriatelfer.com/cart"
    },
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": req.session.cart.totalPrice
        },
        "description": "product"
    }]
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      req.flash("error_message", error.response);
    } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

});


router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": req.session.cart.totalPrice
        }
    }]
  };
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        req.flash("error_message", error.response);
    } else {
		req.flash("success_message", "You have succesfully made your purchase");
		delete req.session.cart;
		res.redirect('/success');
    }
  });
  
});




module.exports = router;
// standard node import
import dropin from 'braintree-web';


Template.braintree_payment.onCreated(function() {
  // check if the order costs nothing (no need for payment information)
  const order = this.data;
  if (order.total_price === 0) {
    Meteor.call("getNoPaymentReceipt", function(err, receipt) {
      console.log(receipt);
      _saveReceipt(order, receipt);
    });
  }

  // set up the braintree dropin ui
  // retrieve braintree client token from server
  HTTP.get('/payments/braintree/getClientToken', function(err, res) {
    const token = res.data;
    dropin.setup(token.clientToken, "dropin", {
      container: "dropin-container",
      onPaymentMethodReceived: function(token) {
        console.log("braintree payment nonce:", token);
        // TODO check for errors
        // TODO implement
        // Meteor.call("createTransaction")
        // or Meteor.call("createDelayedTransaction") etc.
        // then in callback
        // on transaction success, mark order as paid and finalize
        // Meteor.call("btSaveReceipt") etc.
        Meteor.call("getNoPaymentReceipt", function(err, receipt) {
          _saveReceipt(order, receipt);
        });
      },
    });
  });
});

function _saveReceipt(order, receipt) {
  // TODO implement
  const order_id = order._id;
  const event_id = order.event_id;
  Meteor.call("saveReceipt", order._id, receipt, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      _finalizeOrder(event_id, order_id);
    }
  });
}

function _finalizeOrder(event_id, order_id) {
  Meteor.call("finalizeOrder", event_id, order_id, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Router.go("order.receipt", {order_id: order_id});
    }
  });
}

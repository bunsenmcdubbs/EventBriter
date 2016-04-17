import braintree from 'braintree';

const bt_gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: Meteor.settings.private.braintree.merchantId,
  publicKey: Meteor.settings.private.braintree.publicKey,
  privateKey: Meteor.settings.private.braintree.privateKey,
});

Meteor.methods({
  btGenerateClientToken: function(callback) {
    bt_gateway.clientToken.generate({}, callback);
  },
  btCreateTransaction: function() {
    // TODO implement
    console.log("TODO implement createTransaction");
  },
  btCreateDelayedTransaction: function() {
    // TODO implement
    console.log("TODO implement createDelayedTransaction");
  },
  getNoPaymentReceipt: function() {
    return {
      provider: "none",
      token: null,
    };
  },
  saveReceipt: function(order_id, receipt) {
    // TODO implement
    console.log("TODO implement btSaveReceipt");
    const order = Orders.findOne({_id: order_id});
    const add_receipt = {
      $set: {
        receipt: receipt,
      }
    };
    return Orders.update({_id: order_id}, add_receipt) == 1;
  }
});

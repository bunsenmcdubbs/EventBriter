// TODO make this configurable and packaged

Meteor.methods({
  requestRefund(order_id) {
    const order = Orders.findOne({_id: order_id});
    if (!order.receipt) {
      // TODO throw error!
      console.log("no receipt, this is an incomplete order");
      return;
    }

    if (order.receipt.refunded) {
      // TODO throw error!
      console.log("already refunded!");
      return;
    }

    if (order.receipt.provider === "none") {
      // nothing to do here, just skip to success
      console.log("nothing to do for payment-less order. directly approveRefund");
      Meteor.call("approveRefund", order_id);
    }

    return true;
  },
  approveRefund(order_id) {
    const order = Orders.findOne({_id: order_id});
    if (!order.receipt) {
      // TODO throw error
      console.log("no receipt, this is an incomplete order");
      return;
    }

    if (order.receipt.refunded) {
      // TODO throw error!
      console.log("already refunded!");
      return;
    }

    if (order.receipt.provider === "none") {
      // nothing to do here, just skip to success
      console.log("nothing to do for a payment-less order");
    }

    const set_refunded = {
      $set: {
        receipt: {
          refunded: true,
        },
      },
    };

    const success = Orders.update({_id: order_id}, set_refunded);
    return success;
  },
});

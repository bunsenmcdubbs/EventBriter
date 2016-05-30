// TODO make this configurable and packaged
// refer to Meteor.startup methods etc.

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

    // TODO add flag for pending refund request

    return true;
  },
  approveRefund(order_id) {
    const order = Orders.findOne({_id: order_id});
    const event_id = order.event_id;
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

    const removed_tickets = [];
    _(order.tickets).each(function(ticket) {
      const removed_ticket = Meteor.call("_removeSoldTicketFromEvent", event_id, ticket.ticket_id);
      removed_tickets.push(removed_ticket);
    });

    const update_event = {
      $set: {
        receipt: {
          refunded: true,
        },
        tickets: removed_tickets,
      },
    };

    const success = Orders.update({_id: order_id}, update_event);
    return success;
  },
});

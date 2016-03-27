// Router.route("/order/pending/:order_id", {
//   // TODO add 404 error handling
//   action: function() {
//     const order_id = this.params.order_id;
//     this.redirect("order.create.attendee_info", {order_id: order_id});
//   },
//   name: "order.create",
// });

Router.route("/order/pending/:order_id/attendee_info", {
  data: function() {
    // TODO prevent reactive reload from triggering error when ticket is
    // marked as `{pending: false}`
    const pending_order_id = this.params.order_id;
    const pending_order = Orders.findOne({
      _id: pending_order_id,
      pending: true,
    });

    _(pending_order.tickets).each(function(ticket) {
      ticket.event_id = pending_order.event_id;
      ticket.order_id = pending_order._id;
    });
    return pending_order;
  },
  template: "order_edit_attendee_info",
  name: "order.create.attendee_info",
});

Router.route("/order/pending/:order_id/payment", {
  data: function() {
    const order_id = this.params.order_id;
    const order = Orders.findOne({
      _id: order_id,
    });

    return order;
  },
  action: function() {
    const order_id = this.params.order_id;
    this.redirect("order.receipt", {order_id: order_id});
  },
  // TODO actually implement payments
  // TODO implement template
  // template: "order_payment_info",
  name: "order.create.payment_info",
});

function _getPopulatedOrder(order_id) {
  const order = Orders.findOne({
    _id: order_id,
  });

  order.event = Events.findOne({_id: order.event_id});

  order.tickets = _(order.tickets)
  .chain()
  .pluck("ticket_id")
  .map(function(ticket_id) {
    const ticket = Tickets.findOne({_id: ticket_id});
    return ticket;
  })
  .value();

  return order;
}

Router.route("/order/:order_id/receipt", {
  data: function() {
    const order_id = this.params.order_id;
    return _getPopulatedOrder(order_id);
  },
  template: "order_receipt",
  name: "order.receipt",
});

Router.route("/order/:order_id/attendee_info", {
  data: function() {
    const order = Orders.findOne({
      _id: this.params.order_id,
    });
    return order;
  },
  template: "order_edit_attendee_info",
  name: "order.edit.attendee_info",
});

// TODO protect this route
Router.route("/order/mine", {
  data: function() {
    const order_ids = Meteor.user().orders;
    const orders = _(order_ids).map(_getPopulatedOrder);
    return {orders: orders};
  },
  template: "order_mine",
  name: "order.by_user"
});

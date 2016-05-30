function _getPopulatedOrder(order_id) {
  const order = Orders.findOne({
    _id: order_id,
  });

  order.event = Events.findOne({_id: order.event_id});

  // skip this if order is pending or refunded
  if (!order.pending && !(order.receipt && order.receipt.refunded)) {

    order.tickets = _(order.tickets)
    .chain()
    .pluck("ticket_id")
    .map(function(ticket_id) {
      const ticket = _findTicket(order.event._id, ticket_id);
      return ticket;
    })
    .value();
  }

  return order;
}

function _findTicketType (event_id, ticket_id) {
  const ticket_types = Events.findOne({_id: event_id}).tickets;
  return _(ticket_types).find(function(ticket_type) {
    return ticket_type.id === ticket_id;
  });
}

function _findTicket (event_id, ticket_id) {
  const ticket_types = Events.findOne({_id: event_id}).tickets;
  for (let ticket_type of ticket_types) {
    const tickets = ticket_type.sold;
    if (tickets[ticket_id] !== undefined) {
      return tickets[ticket_id];
    }
  }
  return undefined;
}

OrderController = RouteController.extend({
  data: function() {
    const order_id = this.params.order_id;
    return _getPopulatedOrder(order_id);
  },
});

PendingOrderController = RouteController.extend({
  data: function() {
    // TODO prevent reactive reload from triggering error when ticket is
    // marked as `{pending: false}`
    const pending_order_id = this.params.order_id;
    const pending_order = Orders.findOne({
      _id: pending_order_id,
      pending: true,
    });

    // console.log("pending order:", pending_order);

    pending_order.event = Events.findOne({_id: pending_order.event_id});

    let total_price = 0;
    _(pending_order.tickets).each(function(ticket) {
      ticket.event_id = pending_order.event_id;
      ticket.order_id = pending_order._id;
      total_price += _findTicketType(pending_order.event_id, ticket.type).price;
    });
    pending_order.total_price = total_price;

    return pending_order;
  },
});

// Router.route("/order/pending/:order_id", {
//   // TODO add 404 error handling
//   action: function() {
//     const order_id = this.params.order_id;
//     this.redirect("order.create.attendee_info", {order_id: order_id});
//   },
//   name: "order.create",
// });

Router.route("/order/pending/:order_id/attendee_info", {
  controller: PendingOrderController,
  template: "order_edit_attendee_info",
  name: "order.create.attendee_info",
});

Router.route("/order/pending/:order_id/payment", {
  controller: PendingOrderController,
  template: "order_payment_info",
  name: "order.create.payment_info",
});

Router.route("/order/:order_id/receipt", {
  controller: OrderController,
  template: "order_receipt",
  name: "order.receipt",
});

Router.route("/order/:order_id/attendee_info", {
  controller: OrderController,
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

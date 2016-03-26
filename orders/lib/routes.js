Router.route("/order/pending/:order_id", {
  // TODO add 404 error handling
  action: function() {
    const order_id = this.params.order_id;
    this.redirect("order.create.attendee_info", {order_id: order_id});
  },
  name: "order.create",
});

Router.route("/order/pending/:order_id/attendee_info", {
  data: function() {
    const pending_order_id = this.params.order_id;
    const pending_order = Orders.findOne({
      _id: pending_order_id,
      pending: true,
    });
    _(pending_order.tickets).each(function(ticket) {
      ticket.event_id = pending_order.event_id;
      ticket.order_id = pending_order._id;
    });
    console.log(pending_order);
    return pending_order;
  },
  template: "order_edit_attendee_info",
  name: "order.create.attendee_info",
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

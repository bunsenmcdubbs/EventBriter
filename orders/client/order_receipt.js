Template.order_receipt.helpers({
  get_ticket_label: function(ticket_type_id) {
    const ticket_defs = this.event.tickets;
    const ticket_label = _(ticket_defs)
    .find(function(ticket_def) {
      return ticket_def.id === ticket_type_id;
    })
    .label;

    return ticket_label;
  },
});

Template.order_receipt.events({
  "click .js-edit-order": function(event, instance) {
    const order = instance.data;
    if (order.pending) {
      Router.go('order.create.attendee_info', {order_id: order._id});
    } else {
      Router.go('order.edit.attendee_info', {order_id: order._id});
    }
  }
});

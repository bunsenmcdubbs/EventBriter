Template.registerHelper("get_ticket_label", function(event, ticket_type_id) {

  if (typeof event === "string") {
    event = Events.findOne({_id: event});
  }

  const ticket_label = _(event.tickets)
  .find(function(ticket_def) {
    return ticket_def.id === ticket_type_id;
  })
  .label;

  return ticket_label;
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

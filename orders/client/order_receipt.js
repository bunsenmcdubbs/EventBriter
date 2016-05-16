Template.registerHelper("get_ticket_label", function(event, ticket_type_id) {
  if (!event) {
    return;
  }

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
  },
  "click .js-delete-order": function(event, instance) {
    const order = instance.data;
    if (order.pending) {
      Meteor.call("deletePendingOrder", order._id, function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("deleted", success, "order(s)");
        }
      });
    } else {
      console.log("trying to delete an order");
      Meteor.call("requestRefund", order._id, function(error, success) {
        if (error) {
          console.log(error);
        } else {
          const new_order = Orders.findOne({_id: order._id});
          if (new_order.receipt.refunded) {
            Meteor.call("deleteOrder", order._id, function(error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log("successfully deleted order");
              }
            });
          }
        }
      });
    }
  },
});

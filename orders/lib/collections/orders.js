Orders = new Mongo.Collection("orders");

Orders.schema = new SimpleSchema({
  user_id: {type: String, regEx: SimpleSchema.RegEx.Id},
  event_id: {type: String, regEx: SimpleSchema.RegEx.Id},
  tickets: {type: [Object], blackbox: true}, // TODO make this more strict
  pending: {type: Boolean, optional: true},
  // payments: {type: Object, optional: true}, // TODO needed later?
  receipt: {type: Object, optional: true, blackbox: true}
});

Orders.attachSchema(Orders.schema);

Orders.allow({
  update: function(userId, doc) {
    return userId === doc.user_id;
  },
});

Meteor.methods({
  // TODO add link to user account
  // TODO add TTL for pending orders
  // https://docs.mongodb.org/manual/tutorial/expire-data/
  createAndInsertPendingOrder: function(eventId, tickets){
    check(this.userId, String); // check the user is signed in
    check(eventId, String); // check eventId is not null
    check(tickets, Object); // check tickets is not null

    const event = Events.findOne({_id: eventId});
    check(event, Object); // check eventId is valid (and found event)

    const requested_tickets = [];
    for (let ticket_type_id in tickets) {
      const number_of_tickets = tickets[ticket_type_id];

      // find the matching ticket definition
      let ticket_def = _(event.tickets).find(function(ticket_def) {
        return ticket_def.id === ticket_type_id;
      });

      // this should never happen
      if (!ticket_def) {
        throw new Meteor.Error("invalid_ticket_id",
          "cannot find matching ticket type for this event");
      }

      for (let i = 0; i < number_of_tickets; i++) {
        // assign id's to all tickets
        const new_ticket_id = Random.id();
        requested_tickets.push({
          _id: new_ticket_id,
          type: ticket_type_id,
        });
      }
    }

    // new order is a regular order object with an array of
    // fully defined ticket objects
    const new_order = {
      user_id: this.userId,
      event_id: eventId,
      pending: true, // TODO implement TTL expiry times for pending orders
      tickets: requested_tickets,
    };

    const order_id = Orders.insert(new_order);

    // TODO check if this failed
    Meteor.call("_addOrderToUser", order_id);

    return order_id;
  },
  finalizeOrder: function(event_id, order_id) {
    const pending_order = Orders.findOne({_id: order_id});
    if (!pending_order.pending) {
      throw new Meteor.Error("order_error", "tickets have already been generated");
    }
    // TODO implement rollbacks
    const ticket_array = pending_order.tickets;

    // validate tickets and check availablity
    Meteor.call("validateTickets", event_id, ticket_array);

    // insert sold ticket objects into the event.tickets -> sold tickets
    _(ticket_array).each(function(ticket) {
      ticket.event = event_id;
      ticket.order = order_id;
      const success = Meteor.call("_addSoldTicketToEvent", event_id, ticket);
      if (!success) {
        console.log("SUPER FAIL");
      }
    });

    // insert order into event orders array (already in orders collection
    // and user orders array)
    let success = Meteor.call("_addOrderToEvent", event_id, order_id);
    if (!success) {
      console.log("SUPER FAIL2");
    }

    // convert order from pending to finalized form
    // change order's ticket field to array of ticket ids
    // (ticket objects will be stored in event)
    const order_tickets = _(ticket_array).map(function(ticket) {
      return {
        ticket_id: ticket._id,
      };
    });
    success = Orders.update({_id: order_id}, {
      $set: {
        pending: false,
        tickets: order_tickets,
      },
    });

    return success;
  },
  updateOrder: function(event_id, order_id, ticket_array) {
    const order = Orders.findOne({_id: order_id});

    // check that number of tickets still matches order's record
    if (order.tickets.length !== ticket_array.length) {
      throw new Meteor.Error("corrupted_data",
        "number of tickets for this order does not match records");
    }

    if (order.pending) {
      for (let ticket of ticket_array) {
        // TODO check for success
        Meteor.call("_updatePendingTicketInfo", order_id, ticket);
      }
    } else {
      for (let ticket of ticket_array) {
        Meteor.call("_updateTicketInfo", event_id, ticket);
      }
    }
  },
  // precondition: order is not pending and refund approved
  deleteOrder: function(order_id) {
    const order = Orders.findOne({_id: order_id});

    // block further execution if order is not refunded
    if (!order.receipt.refunded) {
      console.log("order must already have been refunded!");
      throw new Meteor.Error("unrefunded_ticket", "ticket must be refunded to delete");
    }

    Meteor.call("_removeOrderFromEvent", order.event_id, order._id);
    Meteor.call("_removeOrderFromUser", order_id, order.user_id);
    return Orders.remove({
      _id: order_id
    });
  },
  deletePendingOrder: function(order_id) {
    // const order = Orders.findOne({
    //   _id: order_id,
    //   pending: true,
    // });
    //
    // if (!order) {
    //   throw new Meteor.Error("no_such_pending_order",
    //     "There is no pending order with matching id");
    // }

    const user_id = Orders.findOne({_id: order_id}).user_id;
    const order_remove_success = Orders.remove({_id: order_id});

    const remove_order_from_user = {
      $pull: {
        orders: order_id,
      },
    };
    const user_order_remove_success = Meteor.users.update({_id: user_id}, remove_order_from_user);

    // TODO check success codes
    return order_remove_success;
  },
});

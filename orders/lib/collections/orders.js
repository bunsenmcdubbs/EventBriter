Orders = new Mongo.Collection("orders");

Orders.schema = new SimpleSchema({
  user_id: {type: String, regEx: SimpleSchema.RegEx.Id},
  event_id: {type: String, regEx: SimpleSchema.RegEx.Id},
  tickets: {type: [Object], blackbox: true}, // TODO make this more strict
  pending: {type: Boolean, optional: true},
  payments: {type: Object, optional: true},
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
      // `payment` field will be filled by the payments module
    };

    const order_id = Orders.insert(new_order);

    // TODO check if this failed
    Meteor.call("_addOrderToUser", order_id);

    return order_id;
  },
  finalizeOrder: function(event_id, order_id, ticket_array) {
    if (!Orders.findOne({_id: order_id}).pending) {
      throw new Meteor.Error("order_error", "tickets have already been generated");
    }
    // TODO implement rollbacks

    // validate tickets and check availablity
    Meteor.call("validateTickets", event_id, ticket_array);

    // insert sold ticket objects into the event.tickets -> sold tickets
    _(ticket_array).each(function(ticket) {
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
});

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
  createPendingOrder: function(eventId, tickets){
    check(this.userId, String); // check the user is signed in
    check(eventId, String); // check eventId is not null
    check(tickets, Object); // check tickets is not null

    const event = Events.findOne({_id: eventId});
    check(event, Object); // check eventId is valid (and found event)

    const requested_tickets = [];
    for (let ticket_type_id in tickets) {
      const number_of_tickets = tickets[ticket_type_id];

      // find the matching ticket definition
      let ticket_info = null;
      for (let ticket of event.tickets) {
        if (ticket.id === ticket_type_id) {
          ticket_info = ticket;
          break;
        }
      }

      // this should never happen
      if (!ticket_info) {
        throw new Meteor.Error("invalid_ticket_id",
          "cannot find matching ticket type for this event");
      }

      for (let i = 0; i < number_of_tickets; i++) {
        requested_tickets.push({
          type: ticket_type_id,
        });
      }
    }

    const new_order = {
      user_id: this.userId,
      event_id: eventId,
      pending: true,
      tickets: requested_tickets, // TODO will this be ok?
      // `payment` field will be filled by the payments module
    };

    const order_id = Orders.insert(new_order);

    // TODO check if this failed
    Meteor.call("_addOrderToUser", order_id);

    return order_id;
  },
  finalizeOrder: function(event_id, order_id, ticket_array) {
    // TODO ensure order is still pending
    if (!Orders.findOne({_id: order_id}).pending) {
      throw new Meteor.Error("order_error", "tickets have already been generated");
    }
    // TODO implement rollbacks
    const ticket_ids = Meteor.call("insertTickets", event_id, ticket_array);

    // insert sold ticket_ids into the event.tickets -> sold array
    _(ticket_ids).each(function(ticket_id) {
      const ticket_type = Tickets.findOne({_id: ticket_id}).type;
      const success = Meteor.call("_addSoldTicket", event_id, ticket_type, ticket_id);
      if (!success) {
        console.log("SUPER FAIL");
      }
    });

    let success = Meteor.call("_addOrder", event_id, order_id);
    if (!success) {
      console.log("SUPER FAIL2");
    }

    const order_tickets = _(ticket_ids).map(function(ticket_id) {
      return {
        ticket_id: ticket_id,
      };
    });

    Orders.update({_id: order_id}, {
      $set: {
        pending: false,
        tickets: order_tickets,
      },
    });

    return ticket_ids;
  },
});

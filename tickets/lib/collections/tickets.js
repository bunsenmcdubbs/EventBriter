Tickets = new Mongo.Collection("tickets");

Tickets.schema = new SimpleSchema({
  type: {type: String},
  event: {type: String, regEx: SimpleSchema.RegEx.Id},
  // TODO add order field
  // TODO add attendee info field (store schema and validate from event page?)
  attendee_info: {type: Object, optional: true, blackbox: true},
});

Tickets.attachSchema(Tickets.schema);

Meteor.methods({
  insertTickets: function(event_id, ticket_array) {
    // TODO validate all tickets

    const event = Events.findOne({_id: event_id});

    // check tickets are available
    const number_of_tickets = {};
    _(ticket_array).each(function(ticket) {
      number_of_tickets[ticket.type] = number_of_tickets[ticket.type] + 1 || 1;
    });
    _(number_of_tickets).each(function(number, type) {
      const ticket_type = _(event.tickets).find(function(ticket) {
        return ticket.id === type;
      });

      // assert ticket_type not null

      // check tickets of this type are still available
      const number_sold = !!ticket_type.sold ? ticket_type.sold.length : 0;
      if (ticket_type.total - number_sold - number < 0) {
        throw new Meteor.Error("insufficient_tickets_remaining",
          "there are not enough tickets available to complete this order");
      }
    });

    const ticket_ids = [];
    _(ticket_array).each(function(ticket) {
      ticket_ids.push(Tickets.insert(ticket));
    });
    return ticket_ids;
  },
  updateTickets: function(ticket_array) {
    // TODO process tickets individually
  }
});

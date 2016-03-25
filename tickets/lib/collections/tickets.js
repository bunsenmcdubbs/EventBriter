Tickets = new Mongo.Collection("tickets");

Tickets.schema = new SimpleSchema({
  type: {type: String},
  event: {type: String, regEx: SimpleSchema.RegEx.Id},
  // TODO add order field
  // TODO add attendee info field (store schema and validate from event page?)
});

Tickets.attachSchema(Tickets.schema);

Meteor.methods({
  insertTickets: function(ticket_array) {
    // TODO process tickets individually
  },
  updateTickets: function(ticket_array) {
    // TODO process tickets individually
  }
});

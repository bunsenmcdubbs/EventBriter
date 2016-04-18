const TicketSchema = new SimpleSchema({
  type: {type: String},
  event: {type: String, regEx: SimpleSchema.RegEx.Id},
  // TODO add order field
  // TODO add attendee info field (store schema and validate from event page?)
  attendee_info: {type: Object, optional: true, blackbox: true},
});

Meteor.methods({
  // validate tickets and check availablity
  validateTickets: function(event_id, ticket_array) {
    // TODO validate all tickets

    const event = Events.findOne({_id: event_id});

    // check tickets are available
    // count number of tickets requested per type in this order
    const number_of_tickets = {};
    _(ticket_array).each(function(ticket) {
      number_of_tickets[ticket.type] = number_of_tickets[ticket.type] + 1 || 1;
    });
    // check that each ticket type has enough tickets remaining to fulfill
    // the entire order
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

    return ticket_array;
  },
  // update ticket info (sold tickets)
  _updateTicketInfo: function(event_id, ticket) {
    // TODO validation

    const ticket_types = Events.findOne({_id: event_id}).tickets;
    let ind = 0;
    for (; ind < ticket_types.length; ind++) {
      if (ticket.type === ticket_types[ind].id) {
        break;
      }
    }
    const ticket_def = ticket_types[ind];

    // sanity check
    // if (ticket_def.id !== ticket.type) { }

    const field_name = "tickets." + ind + ".sold." + ticket._id + ".attendee_info";
    const update_sold_ticket = {
      $set: {},
    };
    update_sold_ticket.$set[field_name] = ticket.attendee_info;
    return Events.update({_id: event_id}, update_sold_ticket) === 1;
  },
  // update ticket info (pending orders)
  _updatePendingTicketInfo: function(pending_order_id, ticket) {
    const tickets = Orders.findOne(
      {
        _id: pending_order_id,
        pending: true,
      }
    ).tickets;

    let ind = 0;
    for (; ind < tickets.length; ind++) {
      if (tickets[ind].id === ticket.id) {
        break;
      }
    }

    const field_name = "tickets." + ind + ".attendee_info";
    const update_pending_ticket = {
      $set: {},
    };
    update_pending_ticket.$set[field_name] = ticket.attendee_info;
    return Orders.update({_id: pending_order_id}, update_pending_ticket) === 1;
  },
  // set checkin status for a ticket either in or out
  // event_id
  // checkin_id
  // ticket_id
  // is_checkin (Boolean) true - check in, false - check out
  // return true if a change was made, else false
  checkInTicket: function(event_id, checkin_id, ticket_id, is_checkin) {
    // TODO validations and existance checking
    const checkins = Events.findOne({_id: event_id}).checkins[checkin_id];
    // TODO check that the ticket id is valid

    // find if the ticket is already checked in
    const was_checkedin = _(checkins.tickets).some(function(t_ticket_id) {
      return t_ticket_id === ticket_id;
    });

    if (was_checkedin === is_checkin) {
      return false;
    }

    const update_checkins = {};
    const field_name = "checkins." + checkin_id + ".tickets";
    const operator = (is_checkin === true) ? "$push" : "$pull";

    update_checkins[operator] = {};
    update_checkins[operator][field_name] = ticket_id;

    return Events.update({_id: event_id}, update_checkins);
  },
});

Template.checkin_event.helpers({
  // TODO un-copy from manage event
  all_tickets: function(tickets) {
    const ticket_array = _(tickets).chain()
    .pluck("sold")
    .map(function(ticket_type) {
      return _(ticket_type || {}).values();
    })
    .reduce(function(memo, sub_ticket_array) {
      return memo.concat(sub_ticket_array);
    }, [])
    // TODO reimplement this to reduce repeated lookups later
    // .map(function(ticket) {
    //   const ticket_copy = _(ticket).clone();
    //   // ticket_copy.event = event;
    //   return ticket_copy;
    // })
    .value();

    return ticket_array;
  },
  get_ticket_label: function(ticket) {
    const ticket_label = _(this.tickets)
    .find(function(ticket_def) {
      return ticket_def.id === ticket.type;
    })
    .label;

    return ticket_label;
  },
  is_checked_in: function(ticket_id) {
    const checked_in = this.checkin;
    return _is_checked_in(checked_in.tickets, ticket_id);
  },
});

const _is_checked_in = function(checkin_in_arr, ticket_id) {
  const ans = _(checkin_in_arr).some(function(t_ticket_id) {
    return t_ticket_id === ticket_id;
  });
  return ans;
};

Template.checkin_event.events({
  "change .js-checkin": function(event, instance) {
    const event_id = instance.data.event_id;
    const checkin_id = instance.data.checkin_id;
    const ticket_id = event.target.dataset.ticketId;
    const checking_in = event.target.checked;

    console.log("checking in ticket", ticket_id, checking_in);

    Meteor.call("checkInTicket", event_id, checkin_id, ticket_id, checking_in,
      function(err, success) {
        if (err) {
          console.log("error checking in ticket #", ticket_id, "to event", event_id, "on", checkin_id);
        } else {
          console.log("success checking in ticket #", ticket_id);
        }
      }
    );
  },
});

Template.view_event.helpers({
  ticket_list: function(tickets) {
    const list = tickets.get();
    return list;
  },
});

Template.edit_event.helpers({
  ticket_list: function(tickets) {
    const list = tickets.get();
    return list;
  },
});

const NEW_TICKET_FORM_ID = ".new-ticket .edit_ticket";

function getNewTicketData () {
  const new_ticket_data = _.object(
    _.map($(NEW_TICKET_FORM_ID).serializeArray(),
      function(e) { return [e.name, e.value]; }
    )
  );

  return new_ticket_data;
}

// export this function for use in event.js
clearNewTicketData = function() {
  const INPUTS = NEW_TICKET_FORM_ID + " input";
  $(INPUTS).val("");
};

// TODO implement delete ticket
Template.edit_event.events({
  "click .add-new-ticket": function(event, instance){
    event.preventDefault();

    // get the ticket list value from the reactive variable
    const ticket_list = instance.data.tickets.get();

    // grab the ticket info and create a new ticket type
    const new_ticket = getNewTicketData();

    // validate ticket type
    // predicate function to check for duplicate labels
    const duplicate_label = function(ticket_label) {
      return ticket_label === new_ticket.label;
    };
    // check that the new ticket has 1) defined and 2) unique label
    if (!new_ticket.label ||
      // check each label in the ticket list, if one matches the new label: fail!
      !_.chain(ticket_list).pluck("label").find(duplicate_label).isUndefined().value()) {

      throw new Meteor.Error("invalid_ticket_definition", "non-unique or null ticket label");
    }
    // TODO ensure all fields are populated
    console.log(new_ticket);
    ticket_list.push(new_ticket);
    // set the ticket list reactive variable
    instance.data.tickets.set(ticket_list);

    // clear the new ticket field
    clearNewTicketData();
  },
  "click .delete-ticket": function(event, instance) {
    event.preventDefault();

    const target_label = event.target.dataset.ticket;
    let ticket_list = instance.data.tickets.get();
    ticket_list = _(ticket_list).reject(
      function (ticket) {
        return ticket.label === target_label;
      }
    );
    instance.data.tickets.set(ticket_list);
  },
});

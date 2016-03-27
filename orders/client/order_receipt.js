Template.order_receipt.helpers({
  get_ticket_label: function(ticket_type_id) {
    const ticket_defs = this.event.tickets;
    const ticket_label = _(ticket_defs)
    .find(function(ticket_def) {
      return ticket_def.id === ticket_type_id;
    })
    .label;

    return ticket_label;
  },
});

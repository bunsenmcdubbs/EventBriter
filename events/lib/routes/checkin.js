// TODO make this more OOP/better design
CheckInController = RouteController.extend({
  onBeforeAction: function() {
    // Check for ownership permissions
    // NOTE: this will also reject unauthenticated users (yay)
    const event_id = this.params.event_id;
    const event = Events.findOne({_id: event_id});

    if (!ownsEvent(Meteor.userId(), event)) {
      this.render("insufficient_permissions");
      throw new Meteor.Error("insufficient_permissions", "user not authorized to edit this event");
    }
    this.next();
  },
  data: function() {
    const event_id = this.params.event_id;
    const checkin_id = this.params.checkin_id;
    const event = Events.findOne({_id: event_id});

    // if needed, filter ticket types
    let tickets = event.tickets;
    if (this.params.checkin_types) {
      types = this.params.checkin_types.split(",");
      console.log("checking in only types:", types);
      tickets = _(tickets).filter(function(ticket) {
        console.log(ticket.id);
        return _(types).contains(ticket.id);
      });
    }

    const checkin = event.checkins[checkin_id];
    checkin.id = checkin_id;

    return {
      event_id: event_id,
      event: event,
      checkin_id: checkin_id,
      checkin: checkin,
      tickets: tickets,
      // filtered: !!this.params.checkin_types,
    };
  },
});

Router.route("/events/:event_id/manage/checkin/:checkin_id", {
  controller: CheckInController,
  template: "checkin_event",
  name: "event.checkin",
});

// checkin types is a comma separated list of ticket types to filter by
Router.route("/events/:event_id/manage/checkin/:checkin_id/type/:checkin_types", {
  controller: CheckInController,
  template: "checkin_event",
  name: "event.checkin_by_type",
});

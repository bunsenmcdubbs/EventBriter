Meteor.publish("Tickets", function() {
  // TODO filter and only show authenticated user's tickets
  // ex) Tickets.find({user_id: Meteor.userId()});

  // (distant) TODO add support for unauthenticated users using OTP etc.
  return Tickets.find({});
});

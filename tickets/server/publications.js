// TODO change this to a complex query on the Events collection
// if unauthenticated user, nothing
// if regular authenticated user:
//  - only tickets that belong to them
//  - AND tickets to events that they own/manage
// if admin, ALL tickets

// Meteor.publish("Tickets", function() {
//   // TODO filter and only show authenticated user's tickets
//   // ex) Tickets.find({user_id: Meteor.userId()});
//
//   // (distant) TODO add support for unauthenticated users using OTP etc.
//   // return Events.find({});
// });

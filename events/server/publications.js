Meteor.publish("Events", function() {
  // TODO add flags for public only, etc
  return Events.find({});
});

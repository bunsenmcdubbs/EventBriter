Meteor.publish("Events", function(){
  return Events.find({});
});

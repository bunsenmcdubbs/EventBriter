Meteor.publish("Orders", function(){
  // TODO add flags for limiting scope of search
  return Orders.find({});
});

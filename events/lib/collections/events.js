Events = new Mongo.Collection("events");

Events.allow({
  update: function(userId, doc){
    return ownsEvent(userId, doc);
  },
  remove: function(){
    return ownsEvent(userId, doc);
  }
});


Meteor.methods({
  insertEvent: function(event_attributes) {
    // TODO user id
    // console.log(this.userId);
    // check(this.userId, String); // check that the user is logged in
    // TODO validate event_attributes

    var new_event = _.extend(event_attributes, {
      // userId: this.userId,
      // username: this.username,
      created: new Date()
    });

    var event_id = Events.insert(new_event);
    return event_id;
  }
});

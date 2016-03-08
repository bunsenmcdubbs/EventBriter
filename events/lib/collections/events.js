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
    check(this.userId, String); // check that the user is logged in
    // TODO validate event_attributes

    var new_event = _.extend(event_attributes, {
      userId: this.userId,
      username: get_username(),
      created: new Date()
    });

    var event_id = Events.insert(new_event);
    return event_id;
  },
  updateEvent: function(event_id, event) {
    check(this.userId, String); // check that the user is logged in

    var old_event = Events.findOne({_id: event_id});

    // this check should never be executed because UI will prevent
    // unqualified users from navigating to the edit page
    if (!ownsEvent(this.userId, old_event)) {
        throw new Meteor.Error("insufficient_permissions",
            "The user is not allowed to edit this event");
    }

    // TODO do schema validation
    event = _.extend(old_event, event);

    return Events.update({_id: event._id}, event) === 1; // successfully updated 1 object
  }

});

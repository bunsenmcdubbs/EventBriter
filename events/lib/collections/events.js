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
    // TODO return some failure/rejection
    // ownsEvent(this.userId, old_event);

    // TODO do schema validation
    // TODO make (form-editable) data and metadata fields?
    event = _.extend(old_event, event);

    return Events.update({_id: event._id}, event) === 1; // successfully updated 1 object
  }

});

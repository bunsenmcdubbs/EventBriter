Events = new Mongo.Collection("events");

SimpleSchema.messages({ dateConflict: "Event ends before it starts" });

const TicketSchema = new SimpleSchema({
  label: {type: String},
  // remaining: {type: Number},
  total: {type: Number, optional: true},
  max_per_person: {type: Number, optional: true},
  sold: {type: [String], optional: true},
  price: {type: Number, optional: true},
});

Events.schema = new SimpleSchema({
  name: {type: String},
  location: {type: String},
  start: {type: Date},
  end: {
    type: Date,
    // TODO FIXME not currently implemented/used
    // custom: function() {
    //   if (this.value < this.field("start").value) {
    //     return {name: "end", type: "dateConflict"};
    //   }
    // }
  },
  created: {type: Date},
  owner: {type: String, regEx: SimpleSchema.RegEx.Id},
  description: {type: String, optional: true},
  tickets: {type: [TicketSchema]},

  // TODO add orders
});

// Schema validation
Events.attachSchema(Events.schema);

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

    const new_event = _.extend(event_attributes, {
      owner: this.userId,
      username: get_username(), // TODO remove this in the future
      created: new Date()
    });
    // TODO validate these objects

    const event_id = Events.insert(new_event);
    return event_id;
  },
  updateEvent: function(event_id, event) {
    check(this.userId, String); // check that the user is logged in

    const old_event = Events.findOne({_id: event_id});

    if (!old_event || !Match.test(old_event._id, String)) {
      throw new Meteor.Error("event_not_found", "No event with matching id found");
    }

    // this check should never be executed because UI will prevent
    // unqualified users from navigating to the edit page
    if (!ownsEvent(this.userId, old_event)) {
      throw new Meteor.Error("insufficient_permissions",
        "The user is not allowed to edit this event");
    }

    if (event.end < event.start) {
      throw new Meteor.Error("date_conflict",
        "The event ends before it starts");
    }

    const fields = [
      "name",
      "location",
      "start",
      "end",
      "description",
      "tickets",
    ];

    // TODO check how this works with a blank description
    // (automatically inserting $unset)
    const changes = { $set: {} };
    for (let key of fields) {
      if (!_.isEqual(old_event[key], event[key])) {
        changes.$set[key] = event[key];
      }
    }

    console.log(changes);

    // check if there were any changes
    if (Object.keys(changes.$set).length === 0) {
      throw new Meteor.Error("no_change", "no edits have been made to the event");
    }

    return Events.update({_id: event_id}, changes) == 1; // successfully updated 1 object
  }

});

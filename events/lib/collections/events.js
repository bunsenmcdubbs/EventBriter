Events = new Mongo.Collection("events");

SimpleSchema.messages({ dateConflict: "Event ends before it starts" });

const TicketDefSchema = new SimpleSchema({
  id: {type: String},
  label: {type: String},
  // remaining: {type: Number},
  total: {type: Number, optional: true},
  max_per_person: {type: Number, optional: true},
  sold: {type: Object, blackbox: true, optional: true},
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
  owner_id: {type: String, regEx: SimpleSchema.RegEx.Id},
  description: {type: String, optional: true},
  tickets: {type: [TicketDefSchema]},
  orders: {type: [String], regEx: SimpleSchema.RegEx.Id, optional: true},
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
      owner_id: this.userId,
      created: new Date()
    });

    console.log(new_event);

    const event_id = Events.insert(new_event);
    const push_new_event = {
      $push: {
        "events": event_id,
      },
    };
    Meteor.users.update({_id: Meteor.userId()}, push_new_event);
    // TODO check for failure

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

    // process and compare event information
    const changes = { $set: {}, $push: {} };

    // compare event infomation fields
    const fields = [
      "name",
      "location",
      "start",
      "end",
      "description",
    ];
    // Interesting note: $set with a blank field will automatically $unset
    for (let key of fields) {
      if (!_.isEqual(old_event[key], event[key])) {
        changes.$set[key] = event[key];
      }
    }

    // compare ticket fields
    const ticket_fields = [
      "label",
      "total",
      "max_per_person",
      "price",
    ];
    _(event.tickets).each(function(new_ticket) {
      let old_index = -1;
      for (let i = 0; i < old_event.tickets.length; i++) {
        const elem = old_event.tickets[i];
        if (elem.id === new_ticket.id) {
          old_index = i;
          break;
        }
      }
      const old_ticket = old_event.tickets[old_index];

      if (old_ticket === undefined) {
        changes.$push = {
          tickets: new_ticket,
        };
      } else {
        for (let key of ticket_fields) {
          // using loose equality `==` to allow comparison between Number
          // and string form of number without more code
          // ex) ("30" == 30) === true
          if (old_ticket[key] != new_ticket[key]) {
            changes.$set["tickets." + old_index + "." + key] = new_ticket[key];
          }
        }
      }
    });

    // check if there were any changes
    if (Object.keys(changes.$set).length === 0 &&
      Object.keys(changes.$push).length === 0) {

      throw new Meteor.Error("no_change", "no edits have been made to the event");
    }

    return Events.update({_id: event_id}, changes) == 1; // successfully updated 1 object
  },
  _addOrderToEvent: function(event_id, order_id) {
    // const orders = Events.findOne({_id: event_id}).orders;
    // assert orders does not contain order_id

    const push_new_order = {
      $push: {
        "orders": order_id
      }
    };

    console.log(event_id, order_id, push_new_order);
    return Events.update({_id: event_id}, push_new_order);
  },
  _addSoldTicketToEvent: function(event_id, ticket) {
    // TODO validation

    const event = Events.findOne({_id: event_id});
    let ind = 0;
    for (; ind < event.tickets.length; ind++) {
      if (event.tickets[ind].id === ticket.type) {
        break;
      }
    }
    const ticket_def = event.tickets[ind];
    // assert ticket_def.type === ticket.type

    // confirm the are enough remaining tickets
    const num_sold = !! ticket_def.sold ? ticket_def.sold.length : 0;
    if (ticket_def.total - num_sold < 1) {
      throw new Meteor.Error("insufficient_tickets_remaining",
        "there are not enough tickets available to complete this order");
    }

    const field = "tickets." + ind + ".sold." + ticket._id;
    const add_sold_ticket = {
      $set: {},
    };
    add_sold_ticket.$set[field] = ticket;
    return Events.update({_id: event_id}, add_sold_ticket) === 1;
  },
  _updateTicketInfo: function(event_id, ticket) {
    // TODO validation
    const event = Events.findOne({_id: event_id});
    const ticket_types = event.tickets;

    let ind = 0;
    for (; ind < ticket_types.length; ind++) {
      if (ticket.type === ticket_types[ind].id) {
        break;
      }
    }
    const ticket_def = ticket_types[ind];

    // sanity check
    // if (ticket_def.id !== ticket.type) { }

    const field_name = "tickets." + ind + ".sold." + ticket._id;
    const update_sold_ticket = {
      $set: {},
    };
    update_sold_ticket.$set[field_name] = ticket;
    return Events.update({_id: event_id}, update_sold_ticket) === 1;
  }
});

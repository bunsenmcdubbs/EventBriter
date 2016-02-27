
Template.event_listing.helpers({
  create: function(){

  },
  rendered: function(){

  },
  event_list: function() {
    return Events.find({});
  }
});

Template.event_listing.events({
  "click #foo": function(event, template){

  }
});

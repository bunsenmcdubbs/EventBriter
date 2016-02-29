Template.event_listing.helpers({
  event_list: function() {
    return Events.find({}, {sort: ['start', 'end']});
  }
});

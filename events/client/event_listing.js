Template.event_listing.helpers({
  event_list: function() {
    const events_cursor = Events.find({}, {sort: ['start', 'end']});
    return events_cursor;
  }
});

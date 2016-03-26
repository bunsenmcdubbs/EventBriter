Meteor.subscribe("Orders");

Template.order_edit_attendee_info.events({
  "click .js-save-attendee-info": function(event, instance){
    event.preventDefault();
    const forms = instance.$("form.edit-attendee-info");
    const attendees_info_raw = _(forms).map(function(form) {
      // TODO i'm so sorry, this code looks awful and I know it
      return _(_($(form).serializeArray()).map(
        function(e) {
          return [e.name, e.value];
        }
      )).object();
    });
    const attendee_info = _(attendees_info_raw).map(function(info) {
      return {
        event: info.event_id,
        order: info.order_id,
        type: info.type,
        attendee_info: {
          name: info.name,
          email: info.email,
          phone: info.phone,
        },
      };
    });
    console.log(attendee_info);
  }
});

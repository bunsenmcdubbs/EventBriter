Meteor.subscribe("Events");

const FORM_ID = "form.edit_event";

function getFormData() {
  const form_data = _.object(
    _.map($(FORM_ID).serializeArray(),
      function(e) { return [e.name, e.value]; }
    )
  );

  form_data.start = yyyyMMddToDate(form_data.start);
  form_data.end = yyyyMMddToDate(form_data.end);
  form_data.created = yyyyMMddToDate(form_data.created);

  return form_data;
}

Template.edit_event.events({
  "submit form.edit_event": function(event) {
    event.preventDefault();

    const data = getFormData();
    // TODO disable save button for existing events until edits are made

    if (this.new_event) {
      Meteor.call("insertEvent", data, function(error, result) {
        if (error) {
          console.log("error", error);
        }
        if (result) {
          Router.go("/events/"+result);
        }
      });
    } else {
      Meteor.call("updateEvent", this._id, data, function(error, result) {
        if (error) {
          console.log("error", error);
        } else {
          // TODO notify user of successful save
          console.log("successfully saved", result);
        }
      });
    }
  }
});

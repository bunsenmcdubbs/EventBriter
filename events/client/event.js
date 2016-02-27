Meteor.subscribe("Events");

var FORM_ID = "form.edit_event";

function getFormData() {
  return _.object(
    _.map($(FORM_ID).serializeArray(),
      function(e) { return [e.name, e.value]; }
    )
  );
}

Template.edit_event.events({
  "submit form.edit_event": function(event) {
    event.preventDefault();
    var data = getFormData();
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

    }
  }
});

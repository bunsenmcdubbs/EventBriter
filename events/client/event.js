Meteor.subscribe("Events");

const FORM_ID = "form.edit_event";

// TODO change into reactive variable/dictionary
function getFormData() {
  const form_data = _.object(
    _.map($(FORM_ID).serializeArray(),
      function(e) { return [e.name, e.value]; }
    )
  );

  // TODO remove this, TEMPORARY HACK copied from tickets.js
  // eventually replace when refactoring everything to use more reactive code
  const NEW_TICKET_FORM_ID = ".edit_ticket";
  form_data.tickets = _($(".edit_ticket")).chain()
  .reject(function(elem) {
    return $(elem).parent().hasClass("new-ticket");
  })
  .map(
    function(form) {
      return $(form).serializeArray();
    }
  ).map(
    function(arr) {
      return _(arr).map(
        function(pair) {
          return [pair.name, pair.value];
        }
      );
    }
  ).map(
    function(e) {
      return _.object(e);
    }
  ).value();

  return form_data;
}

Template.registerHelper("display_date", function(date) {
  return dateToyyyyMMdd(date);
});

Template.registerHelper("display_price", function(price){
  return Number(price).toLocaleString({}, {style: "currency", currency: "USD"});
});

Template.edit_event.events({
  "submit form.edit_event": function(event, instance) {
    event.preventDefault();

    const data = getFormData();
    data.start = yyyyMMddToDate(data.start);
    data.end = yyyyMMddToDate(data.end);

    // TODO make this reactive var dream work
    // data.tickets = instance.data.tickets.get();
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
          clearNewTicketData();
        }
      });
    }
  }
});

get_username = function() {
  // console.log(Meteor.user());
  if (Meteor.user().services) {
    return Meteor.user().services.auth0.name;
  }
  return null;
};

Meteor.methods({
  _addOrderToUser: function(order_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("unauthorized_user", "must be logged in to order");
    }
    const push_new_order = {
      $push: {
        "orders": order_id,
      },
    };
    return Meteor.users.update({_id: Meteor.userId()}, push_new_order);
  },
  _removeOrderFromUser: function(order_id, user_id) {
    const pull_order = {
      $pull: {
        "orders": order_id,
      },
    };
    return Meteor.users.update({_id: user_id}, pull_order);
  },
  _addEventToUser: function(event_id) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("unauthorized_user", "must be logged in to create events");
    }
    const push_new_event = {
      $push: {
        "events": event_id,
      },
    };
    return Meteor.users.update({_id: Meteor.userId()}, push_new_event);
  }
});

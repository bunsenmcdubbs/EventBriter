Meteor.publish("myUserData", function () {
  if (this.userId) {
    return Meteor.users.find(
      {
        _id: this.userId
      },
      {
        fields: {
          'services': 1,
          'orders': 1,
          'events': 1,
        }
      }
    );
  } else {
    this.ready();
  }
});

Meteor.publish("eventOwnerData", function() {
  return Meteor.users.find(
    {
      "events.0": {$exists: true},
    },
    {
      fields: {
        "services.auth0.name": 1,
        "services.auth0.email": 1,
        "services.auth0.picture": 1,
      }
    }
  );
});

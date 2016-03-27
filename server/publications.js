Meteor.publish("userData", function () {
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

get_username = function() {
  // console.log(Meteor.user());
  if (Meteor.user().services) {
    return Meteor.user().services.auth0.name;
  }
  return null;
};

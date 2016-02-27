Meteor.subscribe("userData");

var links = [
  {
    href: "/",
    title: "Home"
  },
  {
    href: "/events/",
    title: "Events"
  },
  {
    href: "/events/new",
    title: "Make a new event!"
  }
];

// TODO implement active flag
Template.navbar.helpers({
  links: function() {
    return links;
  }
});

Template.navbar.events({
  "click button.login": function(event) {
    lock.show(function(err, profile, id_token) {
      if (err) {
        console.log("There was an error :/", err);
        return;
      }
      console.log("Hey dude", profile);
    });
  },
  "click button.logout": function(event) {
    Meteor.logout();
  }
});

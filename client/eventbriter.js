Meteor.subscribe("userData");

var links = [
  {
    href: "/events/",
    title: "Events",
    icon: "calendar"
  },
  {
    href: "/events/new",
    title: "New Event",
    icon: "plus",
    private: true
  }
];

// TODO implement active flag
Template.navbar.helpers({
  links: function() {
    _.each(links, function(link) {
      link.hide = link.private && !Meteor.user();
      return link;
    });
    return links;
  }
});



Template.home.events({
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
    Meteor.logout(function(error) {
        if (error) {
            console.err(error);
        }
        Router.go("/");
     });
  }
});

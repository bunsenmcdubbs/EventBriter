var links = [
  {
    href: "/",
    title: "Home",
  },
  {
    href: "/events/",
    title: "Events",
  },
  {
    href: "/order/mine",
    title: "My Orders",
    private: true,
  },
  // {
  //   href: "/events/new",
  //   title: "Make a new event!",
  //   private: true
  // }
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
    Meteor.logout(function(error) {
        if (error) {
            console.err(error);
        }
        Router.go("/");
     });
  }
});

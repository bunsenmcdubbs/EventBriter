var modules = [
  {
    href: "/",
    template: "home",
    title: "Home"
  },
  {
    href: "/payment",
    template: "card_info",
    title: "Dank"
  }
];

Router.configure({
  layoutTemplate: 'layout'
});

_.each(modules, function(module) {
  Router.route(module.href, function() {
    this.render(module.template);
  });
});

Template.navbar.helpers({
  links: function() {
    console.log(modules);
    return modules;
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

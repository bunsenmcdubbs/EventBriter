var modules = [
  {
    href: "/",
    template: "home",
    title: "Home"
  },
  {
    href: "/events/",
    template: "event_listing",
    title: "All Events"
  },
  {
    href: "/events/:event_id",
    template: "view_event",
    title: "Event Details"
  },
  {
    href: "/events/:event_id/edit",
    template: "edit_event",
    title: "Edit Event"
  },
  {
    href: "/events/:event_id/manage",
    template: "manage_event",
    title: "Manage Event"
  }
];

Router.configure({
  layoutTemplate: 'layout'
});

Router.route("/events/new", {
  template: "edit_event",
  data: function() { return { new_event: true}; },
  action: function() {
    this.render("edit_event", { data: { new_event: true } });
  }
});

_.each(modules, function(module) {
  Router.route(module.href, {
    template: module.template,
    data: function() {
      // TODO FIX THIS
      // console.log(this.params.event_id, Events.findOne({_id: this.params.event_id}));
      return Events.findOne({_id: this.params.event_id});
    },
    action: function() {
      this.render(module.template);
    }
  });
});

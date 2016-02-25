var modules = [
  {
    href: "/payment",
    template: "card_info",
    title: "Enter Payment"
  }
];

_.each(modules, function(module) {
  Router.route(module.href, function() {
    this.render(module.template);
  });
});

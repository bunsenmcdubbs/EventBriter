Router.configure({
  layoutTemplate: 'layout'
});

// TODO write a package with `onBeforeAction` logged in user check

HomePageController = RouteController.extend();

Router.route("/", {
  template: "home",
  controller: HomePageController
});

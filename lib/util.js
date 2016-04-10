// fancy new es6 (javascript 6) syntax. It's just a normal function, don't worry
// call them with `dateToyyyyMMdd("2015-01-03")` etc.
dateToyyyyMMdd = date => date.toISOString().split("T")[0];
yyyyMMddToDate = yyyyMMdd => new Date(yyyyMMdd);

getPublicUserInfo = function(user_id) {
  // stub for client-side because lookup can fail the first time
  // before client mongo is synced
  const user = Meteor.users.findOne({_id: user_id});
  if (Meteor.isClient && !user.services) {
    return {};
  }
  return user.services.auth0;
};

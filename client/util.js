Template.registerHelper("display_date", function(date) {
  if (!_.isDate(date)) {
    return "";
  }
  return dateToyyyyMMdd(date);
});

Template.registerHelper("display_price", function(price){
  if (!_.isNumber(price)) {
    return "";
  }
  if (price === 0) {
    return "Free";
  }
  return Number(price).toLocaleString(
    {},
    {
      style: "currency",
      currency: "USD",
    }
  );
});

Template.registerHelper("get_val", function(r_v){
  r_v = r_v || arguments[0];
  const val = r_v.get();
  console.log("reactive var:", val);
  return val;
});

Template.registerHelper("object_keys", function(object){
  object = object || arguments[0];
  return Object.keys(object);
});

Template.registerHelper("object_values", function(object){
  object = object || arguments[0];
  // TODO eventually change to `Object.values(object)` once that is standardized
  const vals = _(object).values();
  console.log("object values:", vals);
  return vals;
});

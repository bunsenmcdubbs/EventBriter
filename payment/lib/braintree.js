// server-side API endpoint to generate client tokens and send to client
Router.route("/payments/braintree/getClientToken", {
  action: function() {
    const res = this.response;
    res.writeHead(200, {'Content-Type': 'application/json'});
    Meteor.call("btGenerateClientToken", function (err, token) {
      if (err) {
        res.statusCode = 500;
        res.end();
      } else {
        res.write(JSON.stringify(token));
        res.end();
      }
    }, function(){});
  },
  where: 'server',
});

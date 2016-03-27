Template.order_mine.helpers({
  filter_completed_orders: function(orders) {
    const completed_orders = _(orders).filter(function(order) {
      return !order.pending;
    });
    return {orders: completed_orders};
  },
  filter_pending_orders: function(orders) {
    const pending_orders = _(orders).filter(function(order) {
      return !!order.pending;
    });
    return {orders: pending_orders};
  },
});

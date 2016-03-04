ownsEvent = function(userId, doc) {
  if (!doc) {
    return false;
  }
  return userId === doc.userId;
};

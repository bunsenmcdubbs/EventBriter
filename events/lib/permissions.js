ownsEvent = function(userId, doc) {
  if (!doc || !userId) {
    return false;
  }
  return userId === doc.owner_id;
};

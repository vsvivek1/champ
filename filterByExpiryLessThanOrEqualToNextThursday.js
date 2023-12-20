module.exports=function filterByExpiryLessThanOrEqualToNextThursday(items) {
  const today = new Date();
  const nextThursday = new Date(today);

  // Calculate next Thursday
  nextThursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7));

  // Filter items with expiry less than or equal to next Thursday
  const filteredItems = items.filter(item => {
    const itemExpiry = new Date(item.expiry);
    return itemExpiry <= nextThursday;
  });

  return filteredItems;
}
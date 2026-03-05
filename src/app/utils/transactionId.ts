export const getTransactionId = () => {
  return `TID${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

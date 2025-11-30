export const  calculateExpirationTime = (): Date => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() + 15);
  return currentTime;
};

export const formatCryptoAddress = (address: string, cutStart: number = 3, cutEnt: number = 3) => {
  return `${address.slice(0, cutStart)}...${address.slice(address.length - cutEnt)}`
}
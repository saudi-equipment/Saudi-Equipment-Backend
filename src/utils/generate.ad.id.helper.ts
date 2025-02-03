
export const generateAdId = () => {
  let adId = '';

  for (let i = 0; i < 8; i++) {
    adId += Math.floor(Math.random() * 10).toString();
  }

  return adId;
};

export const generateSixDigitCode = () => {
  const randomNumber = Math.floor(Math.floor(Math.random() * 10000));
  const sixDigitCode = randomNumber.toString().padStart(4, '0');
  return sixDigitCode;
};

export const generateExpireTime = () => {
  const currentTime = new Date();
  const futureTime = new Date(currentTime.getTime() + 60000); //60000 for one min
  const expirationTime = futureTime.toTimeString().slice(0, 8);
  return expirationTime;
};

import { useEffect, useState } from 'react';

const useCountdown = (targetDate) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate-Math.floor((new Date().getTime())/1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - Math.floor((new Date().getTime())/1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {
  // calculate time left
  const days = Math.floor(countDown / (60 * 60 * 24));
  const hours = Math.floor((countDown % ( 60 * 60 * 24)) / ( 60 * 60));
  const minutes = Math.floor((countDown % (60 * 60)) / 60);
  const seconds = Math.floor((countDown % ( 60)));

  return [days, hours, minutes, seconds];

};

export { useCountdown };

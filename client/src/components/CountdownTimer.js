import React from 'react';
import DateTimeDisplay from './DateTimeDisplay';
import { useCountdown } from '../hooks/useCountdown';

const ExpiredNotice = () => {
  return (
    <div className="expired-notice">
      <span>Voting Time Expired!!!</span>

    </div>
  );
};

const ShowCounter = ({ days, hours, minutes, seconds }) => {
  return (
    <div className="show-counter">
      <div className="countdown-link">
        <DateTimeDisplay value={days} type={'Days'} isDanger={true} />
        <p>:</p>
        <DateTimeDisplay value={hours} type={'Hours'} isDanger={true} />
        <p>:</p>
        <DateTimeDisplay value={minutes} type={'Mins'} isDanger={true} />
        <p>:</p>
        <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={true} />
      </div>
    </div>
  );
};

const CountdownTimer = (props) => {
  const [days, hours, minutes, seconds] = useCountdown(props.targetDate);
  if (days + hours + minutes + seconds <= 0) {
    return (
      props.votingProcess ? <ExpiredNotice  /> : null
    );
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />

    );
  }
};

export default CountdownTimer;

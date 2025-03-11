import React, { useEffect, useState } from 'react';
import {
  Banner,
  reactExtension,
  InlineStack,
  Text,
  Icon,
  SkeletonText,
  useBuyerJourneyIntercept,
  useSettings
} from '@shopify/ui-extensions-react/checkout';

const REMAINING_MINUTES = 10;

const Extension = () => {
  const [timeLeft, setTimeLeft] = useState(null); // Initially null to indicate loading
  const [timeExpired, setTimeExpired] = useState(false);
  const { minutesRemaining } = useSettings();

  const minutesConfig = minutesRemaining ? parseInt(minutesRemaining) : REMAINING_MINUTES;


  // Interceptor hook called at the top level
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress && timeExpired) {
      return {
        behavior: 'block',
        reason: 'time expired',
        message: 'Time is up! You need to go through the checkout process again.',
      };
    }
    return { behavior: 'allow' };
  });

  useEffect(() => {
    const initialTimeInSeconds = minutesConfig * 60
    setTimeLeft(initialTimeInSeconds); // Initial time left in seconds
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          setTimeExpired(true);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Banner status={timeExpired ? "critical" : "success"} padding="tight">
      {timeLeft === null ? (
        <SkeletonText inlineSize="medium" />
      ) : timeExpired ? (
        <InlineStack>
          <Icon source="alert" />
          <Text>
            Time is up. you need to go through the checkout process again.
          </Text>
        </InlineStack>
      ) : (
        <Text>Your order is reserved for: {formatTime(timeLeft)}</Text>
      )}
    </Banner>
  );
};

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />
);

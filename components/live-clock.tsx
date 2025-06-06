"use client";

import { useState, useEffect } from 'react';

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US');

  return (
    <div className="hidden text-right lg:block">
      <p className="text-sm font-medium text-foreground">{formattedTime}</p>
      <p className="text-xs text-muted-foreground">{formattedDate}</p>
    </div>
  );
}
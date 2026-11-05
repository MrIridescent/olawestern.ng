'use client';

import { useCountUp } from 'use-count-up';

export default function VisitorCounter() {
  const { value } = useCountUp({
    isCounting: true,
    end: 1000,
    duration: 3.5,
    thousandsSeparator: ',',
  });

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-400">Visitors</h3>
      <p className="text-4xl font-bold text-white">{value}</p>
    </div>
  );
}
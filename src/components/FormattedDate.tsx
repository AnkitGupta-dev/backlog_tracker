'use client';

import React, { useState, useEffect } from 'react';

export default function FormattedDate({
  date,
  includeTime = false,
}: {
  date: string;
  includeTime?: boolean;
}) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    const d = new Date(date);
    if (isNaN(d.getTime())) return;

    setFormatted(includeTime ? d.toLocaleString() : d.toLocaleDateString());
  }, [date, includeTime]);

  if (!formatted) return <span className="opacity-0">Loading...</span>;

  return <span>{formatted}</span>;
}

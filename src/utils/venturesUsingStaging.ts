/**
 * Parses the comma-separated venturesUsingStaging string into an array.
 */
export const parseVenturesUsingStaging = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
};

/**
 * Converts an array of ventures to a comma-separated string.
 */
export const stringifyVenturesUsingStaging = (ventures: string[]): string => {
  return ventures.join(',');
};

/**
 * Checks if a venture should use staging API for fetching jackpots.
 */
export const shouldUseStaging = (venture: string, venturesUsingStagingStr: string | undefined): boolean => {
  const venturesUsingStaging = parseVenturesUsingStaging(venturesUsingStagingStr);
  return venturesUsingStaging.includes(venture);
};

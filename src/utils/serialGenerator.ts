export const generateSerialId = (): string => {
  // Generate 8-digit numeric serial ID
  const min = 10000000; // 8-digit minimum
  const max = 99999999; // 8-digit maximum
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};
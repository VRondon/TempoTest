
// Current date + (expiration date - 5 minutes) converted to milliseconds (unixtimestamp)
export const getExpirationDate = (expiresIn: number): number => Date.now() + (expiresIn - 300) * 1000;
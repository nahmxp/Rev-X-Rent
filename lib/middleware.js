import cookieParser from 'cookie-parser';

// Helper method to wait for a middleware to execute before continuing
// And to throw an error if something goes wrong
export const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Apply cookie parser middleware to API routes
export const applyCookieParser = async (req, res) => {
  await runMiddleware(req, res, cookieParser());
}; 
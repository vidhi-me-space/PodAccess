export function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
}

export default (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.status || 500;
  const response = {
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on the server"
        : err.message,
  };

  res.status(statusCode).json(response);
};

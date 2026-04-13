const { app, connectDB } = require('../app');

let dbReadyPromise;

module.exports = async (req, res) => {
  try {
    if (!dbReadyPromise) {
      dbReadyPromise = connectDB();
    }
    await dbReadyPromise;
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
};
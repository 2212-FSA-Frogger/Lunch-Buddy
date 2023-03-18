const router = require('express').Router();

router.use('/user', require('./user.cjs'));
router.use('/tags', require('./routes/tags.cjs'));

// If api route isn't found
router.use((req, res, next) => {
  const err = new Error('API ROUTE NOT FOUND!');
  err.status = 404;
  next(err);
});

module.exports = router;

const mongoose = require('mongoose');
const { mongoPath } = require('../config.json');

module.exports = async() => {
  return mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
}

/*
finally {
  mongoose.connection.close();
}
*/
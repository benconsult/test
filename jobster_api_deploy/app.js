require('dotenv').config();
require('express-async-errors');
const path = require('path')

//extra security packages
const helmet = require('helmet')
const xss = require('xss-clean')


const express = require('express');
const app = express();


//connect to db
const connectDb = require('./db/connect')
const authenticatedUser = require('./middleware/authentication')

//routes
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy',1);//for heroku deployment

//static files middleware
app.use(express.static(path.resolve(__dirname, './client/build')));
app.use(express.json());
app.use(helmet());
app.use(xss());

// extra packages

// no need for root as we have a front end GUI
//  app.get('/', (req, res) => {
//   res.send('jobs api');
// });

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/jobs', authenticatedUser, jobsRouter)

//to use indext.html of the react app
app.get('*', (req,res) =>{
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

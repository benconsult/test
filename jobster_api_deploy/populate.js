require('dotenv').config()

const mockData = require('./mock-data.json')
const Job = require('./models/Jobs')
const connectDb = require('./db/connect')

const start = async ()=>{
   try {
    await connectDb(process.env.MONGO_URI);
    await Job.create(mockData);
    console.log("SUCCCESS!!!");
    process.exit(0);//if there's no error
   } catch (error) {
    console.log(error);
    process.exit(1);//if there's an error
   }

}

start()
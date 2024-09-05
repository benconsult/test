const express = require('express')
const router = express.Router()
//import controller methods

const {getAllJobs,getJob,createJob,updateJob,deleteJob,showStats} =   require('../controllers/jobs')

router.route('/').post(createJob).get(getAllJobs)
router.route('/stats').get(showStats);
router.route('/:id').get(getJob).delete(deleteJob).patch(updateJob)

module.exports =  router

const Job = require('../models/Jobs')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
//for stats, import mongoose and moment
const mongoose = require('mongoose')
const moment = require('moment')

const getAllJobs = async (req, res) =>{
    //console.log(req.query);
    const {search, status,jobType, sort} = req.query;
    //set up query object for search
    const queryObject = {
      createdBy: req.user.userId
    }
    if(search){
       queryObject.position = {$regex:search, $options:'i'}
    }
    //for status
    if(status && status !== 'all'){
        queryObject.status = status
    }
    //for job type - default will be all
    if(jobType && jobType !== 'all'){
        queryObject.jobType = jobType
    }
    //since we are going to chain, we remove await 
    let result = Job.find(queryObject);
    //sort result by latest, oldest,a-z
    if(sort === 'latest'){
        result = result.sort('-createdAt')
    }
    if(sort === 'oldest'){
        result = result.sort('createdAt')
    }
    if(sort === 'a-z'){
        result = result.sort('position')
    }
    if(sort === 'z-a'){
        result = result.sort('position')
    }
    //pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = Number(page - 1) * limit

    result = result.skip(skip).limit(limit)

    const jobs = await result
    //return total job based oon the query e.g 25/10 .. 10,10,5
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs/limit)

    res.status(StatusCodes.OK).json({jobs, totalJobs, numOfPages})
}

const getJob = async (req, res) =>{
    const {user:{userId}, params:{id: jobId},} = req
    const job = await Job.findOne({ _id:jobId, createdBy: userId })
    if(!job){
        throw new NotFoundError(`No job with ${jobId}`)
    }

    res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) =>{
    req.body.createdBy =  req.user.userId
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) =>{
    const { body: { company, position }, user:{userId}, params:{id: jobId},} = req
    if(company === '' || position === ''){
        throw new BadRequestError('Company or Position fields cannot be empty')
    }
    const job = await Job.findByIdAndUpdate({ _id:jobId, createdBy: userId }, req.body, {new:true, runValidators:true })
    if(!job){
        throw new NotFoundError(`No job with ${jobId}`)
    }

    res.status(StatusCodes.OK).json({ job })
   
}

const deleteJob = async (req, res) =>{
    const {user:{userId}, params:{id: jobId},} = req
    const job  = await Job.findByIdAndRemove({ _id: jobId, createdBy:userId})
    res.status(StatusCodes.OK).send()
}

//stats functionality
const showStats = async (req,res)=>{

    let stats = await Job.aggregate([
        {$match: {createdBy: mongoose.Types.ObjectId(req.user.userId)}},
        {$group: { _id:'$status', count: { $sum: 1}}} //status property
    ]);

    //refactor
    stats = stats.reduce((acc,curr)=>{
        //{ interview: 2, pending: 1 }
      const {_id: title, count} = curr;
      acc[title] = count;
      return acc;
    },{})

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0

    };

    console.log(stats);//to test

    //monthly application 
    let monthlyApplications = await Job.aggregate([
        {$match: {createdBy: mongoose.Types.ObjectId(req.user.userId)}},
        {$group: {
            _id: { year : {$year: '$createdAt'}, month: { $month: '$createdAt'}},
            count: { $sum:1 },
    },},
    //ascending order
    {$sort: { '_id.year': -1, '_id.month': -1}},
    {$limit: 6},
    ]);

    //refactor monthly apps
    monthlyApplications = monthlyApplications.map((item)=>{
        const {_id: { year, month}, count } = item;
        const date = moment().month(month - 1).year(year).format('MMM Y')
        return {date,count}
    });

  console.log(monthlyApplications);
    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications});
}
module.exports = {
   getAllJobs,getJob,createJob,updateJob,deleteJob,showStats
}
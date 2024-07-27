import express from 'express'
import userAuth from '../middlewares/authMiddleware.js'
import { createJobController, deleteJobController, getAllJobsController, getJobByIdController, jobSkillsController, updateJobController, jobLocationController, createdJobController } from '../controller/jobsController.js'

const router = express.Router()


//routes

//create job

router.post('/create-job', userAuth, createJobController)


//get jobs
router.get('/get-jobs', userAuth, getAllJobsController)
router.get('/get-job/:id', userAuth, getJobByIdController)

//UPDATE JOBS
router.patch("/update-job/:id", userAuth, updateJobController)

//delete jobs
router.delete("/delete-job/:id", userAuth, deleteJobController)

//jobs Filter 
router.get("/job-skills", userAuth, jobSkillsController)
router.get("/job-location", userAuth, jobLocationController)
router.get("/created-jobs", userAuth, createdJobController)

export default router
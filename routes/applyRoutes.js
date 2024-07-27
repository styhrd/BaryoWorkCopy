import express from 'express'
import userAuth from '../middlewares/authMiddleware.js'
import { acceptApplicantController, applyJobController, rejectApplicantController } from '../controller/applyController.js'
import { deleteApplicantByIdController, getAllApplicantProfilesController, getApplicantByIdController, } from '../controller/applicantController.js'
import { deleteAppliedJobByIdController, getAllAppliedJobsController, getAppliedJobByIdController } from '../controller/appliedJobsController.js'

const router = express.Router()


//routes

//create job

router.post('/apply', userAuth, applyJobController)
router.get('/applicant/:id', userAuth, getApplicantByIdController)
router.get('/appliedJobs', userAuth, getAllAppliedJobsController)
router.get('/appliedJobs/:id', userAuth, getAppliedJobByIdController)
router.post('/accept', userAuth, acceptApplicantController)
router.post('/reject', userAuth, rejectApplicantController)
router.delete('/delapplicant/:id', userAuth, deleteApplicantByIdController)
router.delete('/deleteaj/:id', userAuth, deleteAppliedJobByIdController)

router.get('/getappprofile/:applicantId', userAuth, getAllApplicantProfilesController)

export default router
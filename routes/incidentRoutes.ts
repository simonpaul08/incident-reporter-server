import { Router } from "express";
import {
    createIncident,
    getIncident,
    getIncidentByUser,
    searchIncidentById,
    updateIncident,
    updateIncidentPriority,
    updateIncidentStatus,
} from "../controllers/incident.controller";


const router = Router()

router.route("/search")
    .get(searchIncidentById)

router.route("/")
    .post(createIncident)
    .get(getIncidentByUser)

router.route("/:id")
    .get(getIncident)
    .patch(updateIncident)

router.route("/status/:id")
    .patch(updateIncidentStatus)

router.route("/priority/:id")
    .patch(updateIncidentPriority)



export default router;
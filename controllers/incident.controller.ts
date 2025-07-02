import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateIncidentId } from "../utils/utils";
import { db } from "../drizzle/db";
import { incident } from "../drizzle/schema";
import { and, eq, ilike, is } from "drizzle-orm";


// Create Incident - POST
export const createIncident = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { reporter_name, details, priority, reporter_type } = req.body;

        if (!reporter_name || !reporter_type || !details || !priority) {
            return res.status(400).json({ message: "required fields are missing" })
        }

        const userId = req.user!.id;

        let incidentId: string;
        let isUnique = false;

        // making sure the uniqueness of the incident id
        while (!isUnique) {
            incidentId = generateIncidentId();
            const [existing] = await db.select().from(incident).where(eq(incident.incident_id, incidentId));
            if (!existing) isUnique = true;
        }

        const [newIncident] = await db.insert(incident).values({
            incident_id: incidentId!,
            user_id: userId,
            reporter_name,
            reporter_type,
            details,
            priority,
            status: 'open',
            is_editable: true,
        }).returning();

        res.status(201).json({ message: "incident created successfully", incident: newIncident });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'failed to create incident' });
    }
}

// Get incidents by user - GET
export const getIncidentByUser = async (req: AuthRequest, res: Response) => {
    try {
        const user_id = req.user!.id;
        const results = await db.select().from(incident).where(eq(incident.user_id, user_id));
        res.status(200).json({ message: "incident retrieved successfully", incidents: results });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching incidents' });
    }
};

// Get incident by id - GET
export const getIncident = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const user_id = req.user!.id;

        if (!id) {
            return res.status(400).json({ message: "id are missing" })
        }

        const record = await db.select().from(incident).where(and(
            eq(incident.id, Number(id)),
            eq(incident.user_id, user_id)
        ));

        if (!record.length) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.status(200).json({ message: "incident fetched successfully", incident: record[0] })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching incident' });
    }
}

// Update Incident - PATCH
export const updateIncident = async (req: AuthRequest, res: Response): Promise<any> => {

    try {
        const { id } = req.params;
        const { details, priority, reporter_name, reporter_type, status } = req.body;
        const user_id = req.user!.id;

        if (!id || !details || !priority || !reporter_name || !reporter_type || !status) {
            return res.status(400).json({ message: "required fields are missing" })
        }

        const record = await db.select().from(incident).where(and(
            eq(incident.id, Number(id)),
            eq(incident.user_id, user_id)
        ));

        if (!record.length) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // closed cannot be edited
        if (record[0].status === 'closed') {
            return res.status(400).json({ message: 'Closed incidents cannot be edited' });
        }

        if (status === "closed") {
            // update the is_editable
            await db.update(incident)
                .set({ is_editable: false })
                .where(eq(incident.id, Number(id)))
                .returning();
        }

        const updated = await db.update(incident)
            .set({ details, priority, status })
            .where(eq(incident.id, record[0].id))
            .returning();

        res.status(200).json({ message: "updated incident", incident: updated[0] });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error updating incidents' });
    }

};

// Search incident by ID - GET
export const searchIncidentById = async (req: AuthRequest, res: Response): Promise<any> => {

    const { query } = req.query;
    const user_id = req.user!.id;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'search query is required' });
    }

    try {
        const results = await db
            .select()
            .from(incident)
            .where(
                and(
                    ilike(incident.incident_id, `%${query}%`),
                    eq(incident.user_id, user_id)
                )
            );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No matching incidents found' });
        }

        res.status(200).json({ message: "searched successfully", incident: results });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "search failed", })
    }
}

// update status - PATCH
export const updateIncidentStatus = async (req: AuthRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status } = req.body;

    const user_id = req.user!.id;

    if (!id || !status) {
        return res.status(400).json({ message: "required fields are missing" })
    }

    try {
        const isIncident = await db
            .select()
            .from(incident)
            .where(and(eq(incident.id, Number(id)), eq(incident.user_id, user_id)));

        if (!isIncident.length) {
            return res.status(400).json({ message: "incident does not exists" })
        }

        if (isIncident[0].status === "closed") {
            return res.status(400).json({ message: "closed incident cannot be modified" })
        }


        if (status === "closed") {
            // update the is_editable
            await db.update(incident)
                .set({ is_editable: false })
                .where(eq(incident.id, Number(id)))
                .returning();
        }

        const updated = await db.update(incident)
            .set({ status })
            .where(eq(incident.id, Number(id)))
            .returning();

        res.status(200).json({ message: "updated incident successfully", incident: updated[0] })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "failed to update incident status" })
    }
}

// update priority - PATCH
export const updateIncidentPriority = async (req: AuthRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const { priority } = req.body;

    const user_id = req.user!.id;

    if (!id || !priority) {
        return res.status(400).json({ message: "required fields are missing" })
    }

    try {
        const isIncident = await db
            .select()
            .from(incident)
            .where(and(eq(incident.id, Number(id)), eq(incident.user_id, user_id)));

        if (!isIncident.length) {
            return res.status(400).json({ message: "incident does not exists" })
        }

        if (isIncident[0].status === "closed") {
            return res.status(400).json({ message: "closed incident cannot be modified" })
        }

        const updated = await db.update(incident)
            .set({ priority })
            .where(eq(incident.id, Number(id)))
            .returning();

        return res.status(200).json({ message: "updated incident successfully", incident: updated[0] })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "failed to update incident priority" })
    }
}
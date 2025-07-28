import { Router } from 'express';
import { db } from '../db/client';
import { organization } from "../db/schema";
import { eq } from 'drizzle-orm';

export const organizationRouter = Router();

// GET all organizations
organizationRouter.get('/', async (_req, res) => {
//   try {
    const organizations = await db.select().from(organization);
    res.json(organizations);
//   } catch (error) {
    // console.error('Fetch organizations error:', error);
    // res.status(500).json({ error: 'Failed to fetch organizations' });
//   }
});

// GET organization by ID
organizationRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
//   try {
    const result = await db.select().from(organization).where(eq(organization.id, id));
    if (result.length === 0) return res.status(404).json({ error: 'Organization not found' });
    res.json(result[0]);
//   } catch (error) {
    // console.error('Fetch organization by ID error:', error);
    // res.status(500).json({ error: 'Failed to fetch organization' });
//   }
});

// POST create organization
organizationRouter.post('/', async (req, res) => {
  const { name, country, strategy } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Organization name is required' });
  }

  try {
    const inserted = await db.insert(organization).values({ name, country, strategy }).returning();
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// PUT update organization by ID
organizationRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, country, strategy } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Organization name is required' });
  }

  try {
    const updated = await db
      .update(organization)
      .set({ name, country, strategy })
      .where(eq(organization.id, id))
      .returning();

    if (updated.length === 0) return res.status(404).json({ error: 'Organization not found' });

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// DELETE organization by ID
organizationRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await db.delete(organization).where(eq(organization.id, id));
    if (!deletedCount) return res.status(404).json({ error: 'Organization not found' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});
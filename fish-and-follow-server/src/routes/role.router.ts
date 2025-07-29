import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/client';
import { role } from '../db/schema';

export const roleRouter = Router();

// Temporary placeholder route
// roleRouter.get('/', (req, res) => {
//   res.json({ message: 'Role route works!' });
// });

// GET all role
roleRouter.get('/', async (_req, res) => {
  // try {
    const roles = await db.select().from(role);
    res.json(roles);
  // } catch (error) {
  //   console.error('Fetch roles error:', error);
  //   res.status(500).json({ error: 'Failed to fetch roles' });
  // }
});

// GET role by ID
roleRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  // try {
    const result = await db.select().from(role).where(eq(role.id, id));
    if (result.length === 0) return res.status(404).json({ error: 'Role not found' });
    res.json(result[0]);
  // } catch (error) {
  //   console.error('Fetch role by ID error:', error);
  //   res.status(500).json({ error: 'Failed to fetch role' });
  // }
});

// POST create role
roleRouter.post('/', async (req, res) => {
  const { orgId, userId, role } = req.body;

  if (!orgId || !userId || !role) {
    return res.status(400).json({ error: 'orgId, userId, and roleType are required' });
  }

  try {
    const inserted = await db.insert(role).values({ orgId, userId, role }).returning();
    res.status(201).json(inserted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// PUT update role by ID
roleRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { orgId, userId, role } = req.body;

  if (!orgId || !userId || !role) {
    return res.status(400).json({ error: 'orgId, userId, and roleType are required' });
  }

  try {
    const updated = await db
      .update(role)
      .set({ orgId, userId, role })
      .where(eq(role.id, id))
      .returning();

    if (updated.length === 0) return res.status(404).json({ error: 'Role not found' });

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE role by ID
roleRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(role).where(eq(role.id, id));
    if (!deleted) return res.status(404).json({ error: 'Role not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});
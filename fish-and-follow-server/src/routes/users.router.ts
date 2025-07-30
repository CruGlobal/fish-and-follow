import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { user, role } from '../db/schema';
import { eq, and, or, like, ilike, asc } from 'drizzle-orm';

export const usersRouter = Router();

// GET all users
usersRouter.get('/', async (_req, res) => {
  const users = await db
    .select({
      id: user.id,
      username: user.username,
      email: user.email,
      contactId: user.contactId,
      roleId: role.id,
      role: role.role,
      orgId: role.orgId,
    })
    .from(user)
    .leftJoin(role, eq(user.id, role.userId));
  res.json(users);
});

// GET users with search and filters
usersRouter.get('/search', async (req: Request, res: Response) => {
  const { 
    search = '', 
    limit = '50', 
    role: roleFilter,
    status
  } = req.query;

  const maxResults = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
  const hasSearchQuery = search && typeof search === 'string' && search.trim();

  try {
    // Build filter conditions
    const filterConditions = [];
    
    // Add role filter
    if (roleFilter && roleFilter !== 'all') {
      filterConditions.push(eq(role.role, roleFilter as 'admin' | 'staff'));
    }

    let whereCondition;

    if (hasSearchQuery) {
      const searchQuery = (search as string).trim();
      const searchCondition = or(
        ilike(user.username, `%${searchQuery}%`),
        ilike(user.email, `%${searchQuery}%`),
      );
      
      if (filterConditions.length > 0) {
        whereCondition = and(searchCondition, ...filterConditions);
      } else {
        whereCondition = searchCondition;
      }
    } else if (filterConditions.length > 0) {
      whereCondition = and(...filterConditions);
    }

    // Join users with roles to get role information
    const results = whereCondition
      ? await db
          .select({
            id: user.id,
            username: user.username,
            email: user.email,
            contactId: user.contactId,
            roleId: role.id,
            role: role.role,
            orgId: role.orgId,
          })
          .from(user)
          .leftJoin(role, eq(user.id, role.userId))
          .where(whereCondition)
          .orderBy(asc(user.username))
          .limit(maxResults)
      : await db
          .select({
            id: user.id,
            username: user.username,
            email: user.email,
            contactId: user.contactId,
            roleId: role.id,
            role: role.role,
            orgId: role.orgId,
          })
          .from(user)
          .leftJoin(role, eq(user.id, role.userId))
          .orderBy(asc(user.username))
          .limit(maxResults);

    console.log(
      `✅ Found ${results.length} ${hasSearchQuery ? `user matches for "${search}"` : 'users'}${roleFilter && roleFilter !== 'all' ? ` with role "${roleFilter}"` : ''}`,
    );
    
    res.json({
      success: true,
      users: results,
      query: search || null,
      total: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// GET user by ID
usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db
    .select({
      id: user.id,
      username: user.username,
      email: user.email,
      contactId: user.contactId,
      roleId: role.id,
      role: role.role,
      orgId: role.orgId,
    })
    .from(user)
    .leftJoin(role, eq(user.id, role.userId))
    .where(eq(user.id, id));
  if (result.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

// POST create user
usersRouter.post('/', async (req, res) => {
  const { role: userRole, username, email, contactId, orgId } = req.body;
  
  try {
    const insertedUser = await db.insert(user).values({ username, email, contactId }).returning();
    const insertedRole = await db.insert(role).values({ 
      role: userRole, 
      userId: insertedUser[0].id, 
      orgId: orgId 
    }).returning();
    res.status(201).json({ user: {...insertedUser[0]}, role: insertedRole[0]});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user by ID
usersRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { role: userRole, username, email, contactId } = req.body;

  try {
    const updated = await db
      .update(user)
      .set({ username, email, contactId })
      .where(eq(user.id, id))
      .returning();

    const updatedRole = await db
      .update(role)
      .set({ role: userRole })
      .where(eq(role.userId, id))
      .returning();

    res.json({user: updated[0], role: updatedRole[0]});
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user by ID
usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(user).where(eq(user.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

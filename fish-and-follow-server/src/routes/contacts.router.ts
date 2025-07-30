import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { contact } from '../db/schema';
import { eq, sql, asc, and, or, ilike, desc } from 'drizzle-orm';
import { parseFieldsParameter, getContactFieldObjects } from '../contacts/search-utils';

export const contactsRouter = Router();

// Get all contacts
contactsRouter.get('/', async (_req, res) => {
  const contacts = await db.select().from(contact);
  res.json(contacts);
});

contactsRouter.get('/search', async (req: Request, res: Response) => {
  const {
    search = '',
    threshold = '0.6',
    limit = '50',
    fields,
    year,
    gender,
    campus,
    major,
    isInterested,
    followUpStatusNumber,
  } = req.query;

  const maxResults = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
  const hasSearchQuery = search && typeof search === 'string' && search.trim();

  // Use utility function to parse and validate fields
  const fieldsToSelect = parseFieldsParameter(fields);

  // Build filter conditions using Drizzle ORM
  const buildFilterConditions = () => {
    const conditions: any[] = [];

    if (year && year !== 'all') {
      conditions.push(eq(contact.year, year as any));
    }

    if (gender && gender !== 'all') {
      conditions.push(eq(contact.gender, gender as any));
    }

    if (campus && campus !== 'all') {
      conditions.push(eq(contact.campus, campus as string));
    }

    if (major && major !== 'all') {
      conditions.push(eq(contact.major, major as string));
    }

    if (isInterested && isInterested !== 'all') {
      const isInterestedBool = isInterested === 'true';
      conditions.push(eq(contact.isInterested, isInterestedBool));
    }

    if (followUpStatusNumber && followUpStatusNumber !== 'all') {
      const statusNum = parseInt(followUpStatusNumber as string);
      if (!isNaN(statusNum)) {
        conditions.push(eq(contact.followUpStatusNumber, statusNum));
      }
    }

    return conditions;
  };

  // Build search conditions using Drizzle ORM
  const buildSearchConditions = (searchQuery: string) => {
    const searchTerm = `%${searchQuery.toLowerCase()}%`;

    const conditions = [
      ilike(contact.firstName, searchTerm),
      ilike(contact.lastName, searchTerm),
      ilike(contact.email, searchTerm),
      ilike(contact.phoneNumber, searchTerm),
      ilike(contact.campus, searchTerm),
      ilike(contact.major, searchTerm),
      // Concatenated full name search
      ilike(sql`CONCAT(${contact.firstName}, ' ', ${contact.lastName})`, searchTerm),
    ];

    return or(...conditions);
  };

  try {
    const filterConditions = buildFilterConditions();
    let whereConditions: any;
    
    if (hasSearchQuery) {
      const searchQuery = search.trim();
      const searchConditions = buildSearchConditions(searchQuery);

      // Combine search and filter conditions
      whereConditions =
        filterConditions.length > 0
          ? and(searchConditions, and(...filterConditions))
          : searchConditions;
    } else {
      // Only filter conditions, no search
      whereConditions = filterConditions.length > 0 ? and(...filterConditions) : undefined;
    }

    let results;

    // Build the query using Drizzle ORM
    if (fieldsToSelect.length > 0 && !fieldsToSelect.includes('*')) {
      // Create a select object with only the requested fields
      const selectFields: Record<string, any> = {};
      fieldsToSelect.forEach((field) => {
        if (field in contact) {
          selectFields[field] = contact[field as keyof typeof contact];
        }
      });

      const baseQuery = db.select(selectFields).from(contact);

      results = await (whereConditions ? baseQuery.where(whereConditions) : baseQuery)
        .orderBy(
          ...(hasSearchQuery
            ? [
                // Prioritize exact matches in first name
                desc(
                  sql`CASE WHEN LOWER(${contact.firstName}) = LOWER(${search}) THEN 1 ELSE 0 END`,
                ),
                // Then exact matches in last name
                desc(
                  sql`CASE WHEN LOWER(${contact.lastName}) = LOWER(${search}) THEN 1 ELSE 0 END`,
                ),
                // Then alphabetical by first name
                asc(contact.firstName),
                asc(contact.lastName),
              ]
            : [asc(contact.firstName), asc(contact.lastName)]),
        )
        .limit(maxResults);
    } else {
      // Select all fields
      const baseQuery = db.select().from(contact);

      results = await (whereConditions ? baseQuery.where(whereConditions) : baseQuery)
        .orderBy(
          ...(hasSearchQuery
            ? [
                // Prioritize exact matches in first name
                desc(
                  sql`CASE WHEN LOWER(${contact.firstName}) = LOWER(${search}) THEN 1 ELSE 0 END`,
                ),
                // Then exact matches in last name
                desc(
                  sql`CASE WHEN LOWER(${contact.lastName}) = LOWER(${search}) THEN 1 ELSE 0 END`,
                ),
                // Then alphabetical by first name
                asc(contact.firstName),
                asc(contact.lastName),
              ]
            : [asc(contact.firstName), asc(contact.lastName)]),
        )
        .limit(maxResults);
    }

    console.log(
      `✅ Found ${results.length} ${hasSearchQuery ? `matches for "${search}"` : 'contacts'}${filterConditions.length > 0 ? ' with filters applied' : ''}`,
    );

    // Debug: show first few results
    if (results.length > 0) {
      console.log(
        '📄 Sample results:',
        results.slice(0, 2).map((r) => ({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
        })),
      );
    }

    res.json({
      success: true,
      contacts: results,
      query: search || null,
      total: results.length,
      hasFilters: filterConditions.length > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search contacts' });
  }
});

// Get available contact fields from schema (must be before /:id route)
contactsRouter.get('/fields', (_req, res) => {
  try {
    // Extract field information directly from schema without database queries
    const fields = getContactFieldObjects();

    res.json({
      success: true,
      fields,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error extracting fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract contact fields',
      message: 'Unable to retrieve schema information',
    });
  }
});

// Get contact by ID
contactsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.select().from(contact).where(eq(contact.id, id));
  if (result.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

// POST Create contact
contactsRouter.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    campus,
    major,
    year,
    isInterested,
    gender,
    followUpStatusNumber,
    orgId,
  } = req.body;

  // Ensure orgId is a valid UUID string or use default
  const orgIdValue: string =
    typeof orgId === 'string' && orgId.length === 36
      ? orgId
      : '1f8ff79f-364f-4708-932d-dc6733111759';

  try {
    const inserted = await db
      .insert(contact)
      .values({
        firstName,
        lastName,
        phoneNumber,
        email,
        campus,
        major,
        year,
        isInterested,
        gender,
        followUpStatusNumber,
        orgId: orgIdValue,
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT Update contact
contactsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    campus,
    major,
    year,
    isInterested,
    gender,
    followUpStatusNumber,
    orgId,
  } = req.body;

  try {
    const updated = await db
      .update(contact)
      .set({
        firstName,
        lastName,
        phoneNumber,
        email,
        campus,
        major,
        year,
        isInterested,
        gender,
        followUpStatusNumber,
        orgId,
      })
      .where(eq(contact.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE contact by ID
contactsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(contact).where(eq(contact.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

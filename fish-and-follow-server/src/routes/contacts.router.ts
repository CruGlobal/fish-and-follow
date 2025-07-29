import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { contact, followUpStatus } from '../db/schema';
import { eq, asc, and, or, ilike, sql } from 'drizzle-orm';
import { getContactFieldObjects } from '../contacts/search-utils';

export const contactsRouter = Router();

// Get all contacts
contactsRouter.get('/', async (_req, res) => {
  const contacts = await db
    .select({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      campus: contact.campus,
      major: contact.major,
      year: contact.year,
      isInterested: contact.isInterested,
      gender: contact.gender,
      notes: contact.notes,
      followUpStatusNumber: contact.followUpStatusNumber,
      followUpStatusDescription: followUpStatus.description,
    })
    .from(contact)
    .leftJoin(followUpStatus, eq(contact.followUpStatusNumber, followUpStatus.number));
  res.json(contacts);
});

contactsRouter.get('/search', async (req: Request, res: Response) => {
  const { 
    search = '', 
    limit = '50', 
    year,
    gender,
    campus,
    major,
    isInterested,
    followUpStatusNumber
  } = req.query;

  const maxResults = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
  const searchQuery = search && typeof search === 'string' ? search.trim() : '';

  try {
    // Build filter conditions
    const conditions = [];
    
    // Add search conditions for fuzzy matching on searchable fields
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      const searchConditions = or(
        // Individual field searches
        ilike(contact.firstName, searchPattern),
        ilike(contact.lastName, searchPattern),
        ilike(contact.phoneNumber, searchPattern),
        ilike(contact.email, searchPattern),
        ilike(contact.notes, searchPattern),
        // Combined first and last name search (both orders)
        ilike(sql`${contact.firstName} || ' ' || ${contact.lastName}`, searchPattern),
        ilike(sql`${contact.lastName} || ' ' || ${contact.firstName}`, searchPattern)
      );
      conditions.push(searchConditions);
    }
    
    // Add filter conditions
    if (year && typeof year === 'string' && year !== 'all') {
      conditions.push(eq(contact.year, year as any));
    }
    
    if (gender && typeof gender === 'string' && gender !== 'all') {
      conditions.push(eq(contact.gender, gender as any));
    }
    
    if (campus && typeof campus === 'string' && campus !== 'all') {
      conditions.push(ilike(contact.campus, `%${campus}%`));
    }
    
    if (major && typeof major === 'string' && major !== 'all') {
      conditions.push(ilike(contact.major, `%${major}%`));
    }
    
    if (isInterested && typeof isInterested === 'string' && isInterested !== 'all') {
      conditions.push(eq(contact.isInterested, isInterested === 'true'));
    }
    
    if (followUpStatusNumber && typeof followUpStatusNumber === 'string' && followUpStatusNumber !== 'all') {
      conditions.push(eq(contact.followUpStatusNumber, parseInt(followUpStatusNumber)));
    }

    // Build query with proper typing
    const baseQuery = db
      .select({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        campus: contact.campus,
        major: contact.major,
        year: contact.year,
        isInterested: contact.isInterested,
        gender: contact.gender,
        notes: contact.notes,
        followUpStatusNumber: contact.followUpStatusNumber,
        followUpStatusDescription: followUpStatus.description,
      })
      .from(contact)
      .leftJoin(followUpStatus, eq(contact.followUpStatusNumber, followUpStatus.number));

    // Apply conditions and execute query
    const results = conditions.length > 0 
      ? await baseQuery
          .where(and(...conditions))
          .orderBy(asc(contact.firstName), asc(contact.lastName))
          .limit(maxResults)
      : await baseQuery
          .orderBy(asc(contact.firstName), asc(contact.lastName))
          .limit(maxResults);

    console.log(
      `✅ Found ${results.length} ${searchQuery ? `matches for "${searchQuery}"` : 'contacts'}`,
    );
    
    res.json({
      success: true,
      contacts: results,
      query: searchQuery || null,
      total: results.length,
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

// Get contact statistics
contactsRouter.get('/stats', async (_req, res) => {
  try {
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contact);

    const [interestedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contact)
      .where(eq(contact.isInterested, true));

    const [notInterestedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contact)
      .where(eq(contact.isInterested, false));

    const [maleResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contact)
      .where(eq(contact.gender, 'male'));

    const [femaleResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contact)
      .where(eq(contact.gender, 'female'));

    res.json({
      success: true,
      stats: {
        total: totalResult.count,
        interested: interestedResult.count,
        notInterested: notInterestedResult.count,
        maleCount: maleResult.count,
        femaleCount: femaleResult.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get contact by ID
contactsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db
    .select({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      campus: contact.campus,
      major: contact.major,
      year: contact.year,
      isInterested: contact.isInterested,
      gender: contact.gender,
      followUpStatusNumber: contact.followUpStatusNumber,
      followUpStatusDescription: followUpStatus.description,
    })
    .from(contact)
    .leftJoin(followUpStatus, eq(contact.followUpStatusNumber, followUpStatus.number))
    .where(eq(contact.id, id));
  if (result.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

// POST Create contact
contactsRouter.post('/', async (req, res) => {
  const { firstName, lastName, phoneNumber, email, campus, 
    major, year, isInterested, gender, followUpStatusNumber, notes, orgId } = req.body;
    
  try {
    const inserted = await db.insert(contact).values({ firstName, lastName, 
        phoneNumber, email, campus, major, year, isInterested, gender, 
        followUpStatusNumber, orgId, notes }).returning();
        
    
    // Fetch the created contact with followUpStatusDescription
    const contactWithStatus = await db
      .select({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        campus: contact.campus,
        major: contact.major,
        year: contact.year,
        isInterested: contact.isInterested,
        gender: contact.gender,
        notes: contact.notes,
        followUpStatusNumber: contact.followUpStatusNumber,
        followUpStatusDescription: followUpStatus.description,
      })
      .from(contact)
      .leftJoin(followUpStatus, eq(contact.followUpStatusNumber, followUpStatus.number))
      .where(eq(contact.id, inserted[0].id));
    
    res.status(201).json(contactWithStatus[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// POST Bulk import contacts
contactsRouter.post('/import', async (req, res) => {
  const { contacts: contactsToImport } = req.body;
  
  if (!Array.isArray(contactsToImport) || contactsToImport.length === 0) {
    return res.status(400).json({ error: 'Invalid contacts data. Expected non-empty array.' });
  }

  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ index: number; contact: any; error: string }>
  };

  for (let i = 0; i < contactsToImport.length; i++) {
    const contactData = contactsToImport[i];
    
    try {
      // Validate required fields based on schema
      if (!contactData.firstName || !contactData.lastName) {
        throw new Error('First name and last name are required');
      }

      if (!contactData.phoneNumber) {
        throw new Error('Phone number is required');
      }

      if (!contactData.email) {
        throw new Error('Email is required');
      }

      if (!contactData.campus) {
        throw new Error('Campus is required');
      }

      if (!contactData.major) {
        throw new Error('Major is required');
      }

      if (!contactData.year) {
        throw new Error('Year is required');
      }

      if (!contactData.gender) {
        throw new Error('Gender is required');
      }

      // Validate phone number format (basic validation)
      if (!/^\+?[\d\s\-\(\)]{10,}$/.test(contactData.phoneNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format');
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate gender enum
      if (!['male', 'female'].includes(contactData.gender)) {
        throw new Error('Gender must be either "male" or "female"');
      }

      // Validate year enum
      const validYears = ['1st_year', '2nd_year', '3rd_year', '4th_year', '5th_year', 
                          '6th_year', '7th_year', '8th_year', '9th_year', '10th_year', '11th_year'];
      if (!validYears.includes(contactData.year)) {
        throw new Error(`Year must be one of: ${validYears.join(', ')}`);
      }

      // Check for duplicate phone number or email
      const existingContact = await db
        .select({ id: contact.id })
        .from(contact)
        .where(
          or(
            eq(contact.phoneNumber, contactData.phoneNumber),
            eq(contact.email, contactData.email)
          )
        )
        .limit(1);

      if (existingContact.length > 0) {
        throw new Error('Contact with this phone number or email already exists');
      }

      // Insert the contact
      await db.insert(contact).values({
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        phoneNumber: contactData.phoneNumber,
        email: contactData.email,
        campus: contactData.campus,
        major: contactData.major,
        year: contactData.year,
        isInterested: contactData.isInterested !== undefined ? contactData.isInterested : true,
        gender: contactData.gender,
        notes: contactData.notes || "",
        followUpStatusNumber: contactData.followUpStatusNumber || 1
      });

      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        index: i + 1, // 1-based index for user display
        contact: contactData,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  res.json(results);
});

// PUT Update contact
contactsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, email, campus, 
    major, year, isInterested, gender, followUpStatusNumber, orgId } = req.body;

  try {
    const updated = await db
      .update(contact)
      .set({ firstName, lastName, phoneNumber, email, campus, 
        major, year, isInterested, gender, followUpStatusNumber, orgId })
      .where(eq(contact.id, id))
      .returning();

    // Fetch the updated contact with followUpStatusDescription
    const contactWithStatus = await db
      .select({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        campus: contact.campus,
        major: contact.major,
        year: contact.year,
        isInterested: contact.isInterested,
        gender: contact.gender,
        followUpStatusNumber: contact.followUpStatusNumber,
        followUpStatusDescription: followUpStatus.description,
      })
      .from(contact)
      .leftJoin(followUpStatus, eq(contact.followUpStatusNumber, followUpStatus.number))
      .where(eq(contact.id, id));

    res.json(contactWithStatus[0]);
  } catch (error) {
    console.error("Update Error:", error);
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

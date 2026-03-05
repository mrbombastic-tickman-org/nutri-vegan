import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
};

// Debug logging for database connection
const debugConnection = () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('[DB DEBUG] DATABASE_URL is not set!');
        return null;
    }

    try {
        // Parse URL to extract host (without exposing credentials)
        const url = new URL(dbUrl);
        console.log('[DB DEBUG] Database host:', url.hostname);
        console.log('[DB DEBUG] Database name:', url.pathname.replace('/', ''));
        console.log('[DB DEBUG] Using SSL:', url.searchParams.get('sslmode'));
        return url;
    } catch (e) {
        console.error('[DB DEBUG] Failed to parse DATABASE_URL:', e);
        return null;
    }
};

const createPool = () => {
    const dbUrlInfo = debugConnection();

    if (!dbUrlInfo) {
        console.error('[DB DEBUG] Cannot create pool - DATABASE_URL is invalid');
        throw new Error('DATABASE_URL is not set or invalid');
    }

    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
        // Connection pool settings
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
};

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

// Helper function to run queries
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await pool.connect();
    try {
        return await client.query<T>(text, params);
    } finally {
        client.release();
    }
}

// Helper function to get a single row
export async function queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await query<T>(text, params);
    return result.rows[0] || null;
}

// Helper function to get multiple rows
export async function queryMany<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await query<T>(text, params);
    return result.rows;
}

// Database helper objects that mirror Prisma's API structure
export const db = {
    // User operations
    user: {
        findUnique: async (where: { email: string }) => {
            return queryOne(`
                SELECT id, email, password, name, image, "createdAt", "updatedAt"
                FROM users
                WHERE email = $1
            `, [where.email]);
        },
        findFirst: async (where: { email?: string }) => {
            const conditions: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (where.email) {
                conditions.push(`email = $${paramIndex++}`);
                values.push(where.email);
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            return queryOne(`
                SELECT id, email, password, name, image, "createdAt", "updatedAt"
                FROM users
                ${whereClause}
                LIMIT 1
            `, values);
        },
        create: async (data: { email: string; password: string; name?: string | null; image?: string | null }) => {
            const result = await queryOne(`
                INSERT INTO users (id, email, password, name, image, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
                RETURNING id, email, password, name, image, "createdAt", "updatedAt"
            `, [data.email, data.password, data.name || null, data.image || null]);
            return result;
        },
        count: async () => {
            const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users');
            return parseInt(result?.count || '0');
        },
    },

    // Category operations
    category: {
        findMany: async (options?: { select?: any; orderBy?: any }) => {
            const orderClause = options?.orderBy?.name === 'asc' ? 'ORDER BY name ASC' : '';
            return queryMany(`
                SELECT c.id, c.name, c.slug, c.description, c.icon, c.color, c."createdAt", c."updatedAt",
                       COUNT(dp.id) as diet_plans_count
                FROM categories c
                LEFT JOIN diet_plans dp ON dp."categoryId" = c.id
                GROUP BY c.id, c.name, c.slug, c.description, c.icon, c.color, c."createdAt", c."updatedAt"
                ${orderClause}
            `);
        },
        findUnique: async (where: { slug?: string; id?: string }) => {
            if (where.slug) {
                const category = await queryOne(`
                    SELECT id, name, slug, description, icon, color, "createdAt", "updatedAt"
                    FROM categories
                    WHERE slug = $1
                `, [where.slug]);

                if (!category) return null;

                // Fetch diet plans for this category
                const dietPlans = await queryMany(`
                    SELECT id, title, description, duration, difficulty, calories, protein, carbs, fats, benefits, "dietType", "categoryId"
                    FROM diet_plans
                    WHERE "categoryId" = $1
                    ORDER BY "createdAt" DESC
                `, [category.id]);

                return { ...category, dietPlans };
            }

            if (where.id) {
                return queryOne(`
                    SELECT id, name, slug, description, icon, color, "createdAt", "updatedAt"
                    FROM categories
                    WHERE id = $1
                `, [where.id]);
            }

            return null;
        },
        count: async () => {
            const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM categories');
            return parseInt(result?.count || '0');
        },
    },

    // DietPlan operations
    dietPlan: {
        findUnique: async (where: { id: string }) => {
            return queryOne(`
                SELECT id, title, description, duration, difficulty, calories, protein, carbs, fats, benefits, restrictions, meals, "imageUrl", "isAIGenerated", "dietType", "createdAt", "updatedAt", "categoryId"
                FROM diet_plans
                WHERE id = $1
            `, [where.id]);
        },
    },

    // ChatHistory operations
    chatHistory: {
        findMany: async (options: { where: { userId: string }; orderBy?: any; take?: number }) => {
            const orderClause = options.orderBy?.updatedAt === 'desc' ? 'ORDER BY "updatedAt" DESC' : '';
            const limitClause = options.take ? `LIMIT ${options.take}` : '';
            return queryMany(`
                SELECT id, title, "userId", "createdAt", "updatedAt"
                FROM chat_histories
                WHERE "userId" = $1
                ${orderClause}
                ${limitClause}
            `, [options.where.userId]);
        },
        findUnique: async (where: { id: string; userId?: string }) => {
            let query = `
                SELECT id, title, "userId", "createdAt", "updatedAt"
                FROM chat_histories
                WHERE id = $1
            `;
            const params: any[] = [where.id];

            if (where.userId) {
                query += ' AND "userId" = $2';
                params.push(where.userId);
            }

            const history = await queryOne(query, params);

            if (!history) return null;

            // Fetch messages
            const messages = await queryMany(`
                SELECT id, role, content, "createdAt", "chatId"
                FROM chat_messages
                WHERE "chatId" = $1
                ORDER BY "createdAt" ASC
            `, [where.id]);

            return { ...history, messages };
        },
        create: async (data: { userId: string; title?: string | null }) => {
            return queryOne(`
                INSERT INTO chat_histories (id, "userId", title, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
                RETURNING id, "userId", title, "createdAt", "updatedAt"
            `, [data.userId, data.title || null]);
        },
    },

    // ChatMessage operations
    chatMessage: {
        create: async (data: { chatId: string; role: string; content: string }) => {
            return queryOne(`
                INSERT INTO chat_messages (id, "chatId", role, content, "createdAt")
                VALUES (gen_random_uuid(), $1, $2, $3, NOW())
                RETURNING id, "chatId", role, content, "createdAt"
            `, [data.chatId, data.role, data.content]);
        },
    },

    // UserMetric operations
    userMetric: {
        findMany: async (options: { where: { userId: string; type?: string }; orderBy?: any; take?: number }) => {
            let query = `
                SELECT id, "userId", type, value, unit, "recordedAt"
                FROM user_metrics
                WHERE "userId" = $1
            `;
            const params: any[] = [options.where.userId];

            if (options.where.type) {
                query += ' AND type = $2';
                params.push(options.where.type);
            }

            if (options.orderBy?.recordedAt === 'asc') {
                query += ' ORDER BY "recordedAt" ASC';
            }

            if (options.take) {
                query += ` LIMIT ${options.take}`;
            }

            return queryMany(query, params);
        },
        create: async (data: { userId: string; type: string; value: number; unit: string; recordedAt: Date }) => {
            return queryOne(`
                INSERT INTO user_metrics (id, "userId", type, value, unit, "recordedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
                RETURNING id, "userId", type, value, unit, "recordedAt"
            `, [data.userId, data.type, data.value, data.unit, data.recordedAt]);
        },
    },

    // Raw query for complex operations
    $queryRaw: async (strings: TemplateStringsArray, ...values: any[]) => {
        const text = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `$${i + 1}` : ''), '');
        return query(text, values);
    },
};

// Export pool for direct access if needed
export type { PoolClient };

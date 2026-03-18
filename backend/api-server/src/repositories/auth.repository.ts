import { randomUUID } from 'crypto';

import { pgPool } from '../config/postgres';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at?: string;
};

type CompanyRecord = {
  id: string;
  user_id: string;
  company_name: string;
};

type CreateUserInput = {
  email: string;
  passwordHash: string;
  companyName: string;
  businessType: 'Supplier' | 'Buyer / Distributor' | 'Exporter';
  phone?: string;
  address?: string;
};

const inMemoryUsers: UserRecord[] = [];
const inMemoryCompanies: CompanyRecord[] = [];

export class AuthRepository {
  async findUserByEmail(email: string) {
    if (!pgPool) {
      return inMemoryUsers.find((entry) => entry.email === email) ?? null;
    }

    const result = await pgPool.query<UserRecord>(
      `
      select id, name, email, password_hash, created_at::text as created_at
      from users
      where email = $1
      limit 1
      `,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async findCompanyByUserId(userId: string) {
    if (!pgPool) {
      return inMemoryCompanies.find((entry) => entry.user_id === userId) ?? null;
    }

    const result = await pgPool.query<CompanyRecord>(
      `
      select id, user_id, company_name
      from companies
      where user_id = $1
      limit 1
      `,
      [userId],
    );

    return result.rows[0] ?? null;
  }

  async createUserWithCompany(input: CreateUserInput) {
    if (!pgPool) {
      const userId = randomUUID();
      const companyId = randomUUID();

      const user: UserRecord = {
        id: userId,
        name: 'Account Admin',
        email: input.email,
        password_hash: input.passwordHash,
      };
      const company: CompanyRecord = {
        id: companyId,
        user_id: userId,
        company_name: input.companyName,
      };

      inMemoryUsers.push(user);
      inMemoryCompanies.push(company);

      return { user, company };
    }

    const client = await pgPool.connect();

    try {
      await client.query('begin');

      const userId = randomUUID();
      const companyId = randomUUID();

      const userResult = await client.query<UserRecord>(
        `
        insert into users (id, name, email, password_hash)
        values ($1, $2, $3, $4)
        returning id, name, email, password_hash, created_at::text as created_at
        `,
        [userId, 'Account Admin', input.email, input.passwordHash],
      );

      const companyResult = await client.query<CompanyRecord>(
        `
        insert into companies (
          id,
          user_id,
          company_name,
          business_type,
          address,
          tax_id,
          industry_type,
          phone_number,
          company_account_id,
          verified
        )
        values ($1, $2, $3, $4, $5, 'Not provided', 'Trade', $6, $7, false)
        returning id, user_id, company_name
        `,
        [
          companyId,
          userId,
          input.companyName,
          input.businessType,
          input.address || 'Not provided',
          input.phone || null,
          `CMP-${companyId.slice(0, 8).toUpperCase()}`,
        ],
      );

      await client.query('commit');

      return {
        user: userResult.rows[0],
        company: companyResult.rows[0],
      };
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
}

import { randomUUID } from 'crypto';

import { pgPool } from '../config/postgres';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

type CompanyRecord = {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  address: string;
  tax_id: string;
  industry_type: string | null;
  phone_number: string | null;
  company_account_id: string;
  verified: boolean;
};

type BankAccountRecord = {
  id: string;
  company_id: string;
  account_number: string;
  bank_name: string;
};

type DocumentRecord = {
  id: string;
  company_id: string;
  document_type: string;
  status: string;
  file_url: string;
};

type ProfileJoinedRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  company_id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  address: string;
  tax_id: string;
  industry_type: string | null;
  phone_number: string | null;
  company_account_id: string;
  verified: boolean;
};

type EnsureContext = {
  userId: string;
  companyId: string;
};

const inMemoryUsers = new Map<string, UserRecord>();
const inMemoryCompanies = new Map<string, CompanyRecord>();
const inMemoryBankAccounts = new Map<string, BankAccountRecord[]>();
const inMemoryDocuments = new Map<string, DocumentRecord[]>();

function createDefaultUser(userId: string): UserRecord {
  return {
    id: userId,
    name: 'Ava Rahman',
    email: 'finance@hasnattraders.com',
    password_hash: '',
  };
}

function createDefaultCompany(companyId: string, userId: string): CompanyRecord {
  return {
    id: companyId,
    user_id: userId,
    company_name: 'Hasnat Traders Ltd.',
    business_type: 'Distributor',
    address: 'Plot 32, Dhaka Export Zone',
    tax_id: 'TIN-3278-8821',
    industry_type: 'Trade & Distribution',
    phone_number: '+8801711000000',
    company_account_id: 'CMP-HTL-90812',
    verified: true,
  };
}

function createDefaultDocuments(companyId: string): DocumentRecord[] {
  return [
    {
      id: randomUUID(),
      company_id: companyId,
      document_type: 'Trade license',
      status: 'Verified',
      file_url: 'https://files.tradeflow.dev/docs/trade-license.pdf',
    },
    {
      id: randomUUID(),
      company_id: companyId,
      document_type: 'Tax certificate',
      status: 'Pending',
      file_url: 'https://files.tradeflow.dev/docs/tax-certificate.pdf',
    },
    {
      id: randomUUID(),
      company_id: companyId,
      document_type: 'Identity verification',
      status: 'Verified',
      file_url: 'https://files.tradeflow.dev/docs/identity.pdf',
    },
  ];
}

export class ProfileRepository {
  async ensureProfileContext(context: EnsureContext) {
    if (!pgPool) {
      if (!inMemoryUsers.has(context.userId)) {
        inMemoryUsers.set(context.userId, createDefaultUser(context.userId));
      }
      if (!inMemoryCompanies.has(context.companyId)) {
        inMemoryCompanies.set(context.companyId, createDefaultCompany(context.companyId, context.userId));
      }
      if (!inMemoryDocuments.has(context.companyId)) {
        inMemoryDocuments.set(context.companyId, createDefaultDocuments(context.companyId));
      }
      if (!inMemoryBankAccounts.has(context.companyId)) {
        inMemoryBankAccounts.set(context.companyId, []);
      }

      return;
    }

    await pgPool.query(
      `
      insert into users (id, name, email, password_hash)
      values ($1, $2, $3, '')
      on conflict (id) do nothing
      `,
      [context.userId, 'Ava Rahman', `user-${context.userId}@tradeflow.dev`],
    );

    await pgPool.query(
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
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      on conflict (id) do nothing
      `,
      [
        context.companyId,
        context.userId,
        'Hasnat Traders Ltd.',
        'Distributor',
        'Plot 32, Dhaka Export Zone',
        'TIN-3278-8821',
        'Trade & Distribution',
        '+8801711000000',
        `CMP-${context.companyId.slice(0, 8).toUpperCase()}`,
      ],
    );
  }

  async getUserById(userId: string) {
    if (!pgPool) {
      return inMemoryUsers.get(userId) ?? null;
    }

    const result = await pgPool.query<UserRecord>(
      'select id, name, email, password_hash from users where id = $1 limit 1',
      [userId],
    );

    return result.rows[0] ?? null;
  }

  async updateUserPasswordHash(userId: string, passwordHash: string) {
    if (!pgPool) {
      const user = inMemoryUsers.get(userId);
      if (!user) {
        return;
      }
      user.password_hash = passwordHash;
      return;
    }

    await pgPool.query('update users set password_hash = $2 where id = $1', [userId, passwordHash]);
  }

  async getProfile(companyId: string, userId: string) {
    if (!pgPool) {
      const user = inMemoryUsers.get(userId) ?? null;
      const company = inMemoryCompanies.get(companyId) ?? null;
      return user && company ? { user, company } : null;
    }

    const result = await pgPool.query<ProfileJoinedRow>(
      `
      select
        u.id,
        u.name,
        u.email,
        u.password_hash,
        c.id as company_id,
        c.user_id,
        c.company_name,
        c.business_type,
        c.address,
        c.tax_id,
        c.industry_type,
        c.phone_number,
        c.company_account_id,
        c.verified
      from users u
      join companies c on c.user_id = u.id
      where u.id = $1 and c.id = $2
      limit 1
      `,
      [userId, companyId],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    const user: UserRecord = {
      id: row.id,
      name: row.name,
      email: row.email,
      password_hash: row.password_hash,
    };

    const company: CompanyRecord = {
      id: row.company_id,
      user_id: row.user_id,
      company_name: row.company_name,
      business_type: row.business_type,
      address: row.address,
      tax_id: row.tax_id,
      industry_type: row.industry_type,
      phone_number: row.phone_number,
      company_account_id: row.company_account_id,
      verified: row.verified,
    };

    return { user, company };
  }

  async updateCompany(
    companyId: string,
    patch: Partial<{
      companyName: string;
      businessType: string;
      address: string;
      taxId: string;
      industryType: string;
      phoneNumber: string;
    }>,
  ) {
    if (!pgPool) {
      const company = inMemoryCompanies.get(companyId);
      if (!company) {
        return null;
      }

      if (patch.companyName !== undefined) company.company_name = patch.companyName;
      if (patch.businessType !== undefined) company.business_type = patch.businessType;
      if (patch.address !== undefined) company.address = patch.address;
      if (patch.taxId !== undefined) company.tax_id = patch.taxId;
      if (patch.industryType !== undefined) company.industry_type = patch.industryType;
      if (patch.phoneNumber !== undefined) company.phone_number = patch.phoneNumber;

      return company;
    }

    const result = await pgPool.query<CompanyRecord>(
      `
      update companies
      set
        company_name = coalesce($2, company_name),
        business_type = coalesce($3, business_type),
        address = coalesce($4, address),
        tax_id = coalesce($5, tax_id),
        industry_type = coalesce($6, industry_type),
        phone_number = coalesce($7, phone_number)
      where id = $1
      returning id, user_id, company_name, business_type, address, tax_id, industry_type, phone_number, company_account_id, verified
      `,
      [
        companyId,
        patch.companyName ?? null,
        patch.businessType ?? null,
        patch.address ?? null,
        patch.taxId ?? null,
        patch.industryType ?? null,
        patch.phoneNumber ?? null,
      ],
    );

    return result.rows[0] ?? null;
  }

  async addBankAccount(companyId: string, bankName: string, encryptedAccountNumber: string) {
    if (!pgPool) {
      const entry: BankAccountRecord = {
        id: randomUUID(),
        company_id: companyId,
        bank_name: bankName,
        account_number: encryptedAccountNumber,
      };
      const list = inMemoryBankAccounts.get(companyId) ?? [];
      list.unshift(entry);
      inMemoryBankAccounts.set(companyId, list);
      return entry;
    }

    const result = await pgPool.query<BankAccountRecord>(
      `
      insert into bank_accounts (company_id, account_number, bank_name)
      values ($1, $2, $3)
      returning id, company_id, account_number, bank_name
      `,
      [companyId, encryptedAccountNumber, bankName],
    );

    return result.rows[0];
  }

  async getBankAccounts(companyId: string) {
    if (!pgPool) {
      return inMemoryBankAccounts.get(companyId) ?? [];
    }

    const result = await pgPool.query<BankAccountRecord>(
      `
      select id, company_id, account_number, bank_name
      from bank_accounts
      where company_id = $1
      order by id desc
      `,
      [companyId],
    );

    return result.rows;
  }

  async getDocuments(companyId: string) {
    if (!pgPool) {
      return inMemoryDocuments.get(companyId) ?? [];
    }

    const result = await pgPool.query<DocumentRecord>(
      `
      select id, company_id, document_type, status, file_url
      from documents
      where company_id = $1
      order by id desc
      `,
      [companyId],
    );

    return result.rows;
  }
}

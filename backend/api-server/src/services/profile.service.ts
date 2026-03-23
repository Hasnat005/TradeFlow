import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';

import { env } from '../config/env';
import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase';
import { AppError } from '../utils/app-error';
import { ProfileRepository } from '../repositories/profile.repository';

type AuthContext = {
  userId: string;
  companyId: string;
};

type UpdateProfileInput = Partial<{
  companyName: string;
  businessType: 'Supplier' | 'Distributor' | 'Exporter';
  address: string;
  taxId: string;
  industryType: string;
  phoneNumber: string;
}>;

type AddBankInput = {
  bankName: string;
  accountNumber: string;
};

type AddDocumentInput = {
  documentType: string;
  fileName: string;
  fileBase64: string;
  contentType: string;
};

function deriveEncryptionKey() {
  return pbkdf2Sync(env.DATA_ENCRYPTION_KEY, 'tradeflow-profile', 120000, 32, 'sha256');
}

function maskAccountNumber(raw: string) {
  const visible = raw.slice(-4);
  return `•••• ${visible}`;
}

function encryptAccountNumber(accountNumber: string) {
  const key = deriveEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(accountNumber, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
}

function decryptAccountNumber(cipherText: string) {
  const [ivHex, encryptedHex, tagHex] = cipherText.split(':');

  if (!ivHex || !encryptedHex || !tagHex) {
    throw new AppError(500, 'Invalid encrypted account payload', 'INVALID_ACCOUNT_ENCRYPTION');
  }

  const key = deriveEncryptionKey();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');

  return decrypted;
}

function verifyPassword(password: string, storedHash: string) {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, existingHash] = storedHash.split(':');
  const computedHash = pbkdf2Sync(password, salt, 150000, 32, 'sha256').toString('hex');

  const existing = Buffer.from(existingHash, 'hex');
  const computed = Buffer.from(computedHash, 'hex');

  return existing.length === computed.length && timingSafeEqual(existing, computed);
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function parseBase64Payload(value: string) {
  const payload = value.includes(',') ? value.split(',').pop() ?? '' : value;
  return Buffer.from(payload, 'base64');
}

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(auth: AuthContext) {
    await this.profileRepository.ensureProfileContext(auth);

    const profile = await this.profileRepository.getProfile(auth.companyId, auth.userId);

    if (!profile) {
      throw new AppError(404, 'Profile not found', 'PROFILE_NOT_FOUND');
    }

    const banks = await this.profileRepository.getBankAccounts(auth.companyId);
    const documents = await this.profileRepository.getDocuments(auth.companyId);
    const accountSummary = await this.profileRepository.getAccountSummary(auth.companyId);

    return {
      user: {
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email,
      },
      company: {
        id: profile.company.id,
        companyName: profile.company.company_name,
        businessType: profile.company.business_type,
        address: profile.company.address,
        taxId: profile.company.tax_id,
        industryType: profile.company.industry_type,
        phoneNumber: profile.company.phone_number,
        companyAccountId: profile.company.company_account_id,
        verified: profile.company.verified,
      },
      accountSummary,
      bankAccounts: banks.map((bank) => {
        const decrypted = decryptAccountNumber(bank.account_number);
        return {
          id: bank.id,
          bankName: bank.bank_name,
          maskedAccountNumber: maskAccountNumber(decrypted),
        };
      }),
      documents: documents.map((doc) => ({
        id: doc.id,
        documentType: doc.document_type,
        status: doc.status,
        fileUrl: doc.file_url,
      })),
    };
  }

  async updateProfile(auth: AuthContext, input: UpdateProfileInput) {
    await this.profileRepository.ensureProfileContext(auth);

    const updated = await this.profileRepository.updateCompany(auth.companyId, input);

    if (!updated) {
      throw new AppError(404, 'Profile not found', 'PROFILE_NOT_FOUND');
    }

    return {
      id: updated.id,
      companyName: updated.company_name,
      businessType: updated.business_type,
      address: updated.address,
      taxId: updated.tax_id,
      industryType: updated.industry_type,
      phoneNumber: updated.phone_number,
      companyAccountId: updated.company_account_id,
      verified: updated.verified,
    };
  }

  async changePassword(auth: AuthContext, currentPassword: string, newPassword: string) {
    await this.profileRepository.ensureProfileContext(auth);

    const user = await this.profileRepository.getUserById(auth.userId);

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    if (user.password_hash) {
      let currentMatches = false;

      if (user.password_hash.includes(':')) {
        currentMatches = verifyPassword(currentPassword, user.password_hash);
      } else {
        currentMatches = await bcrypt.compare(currentPassword, user.password_hash);
      }

      if (!currentMatches) {
        throw new AppError(400, 'Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.profileRepository.updateUserPasswordHash(auth.userId, passwordHash);

    return {
      updated: true,
    };
  }

  async addBankAccount(auth: AuthContext, input: AddBankInput) {
    await this.profileRepository.ensureProfileContext(auth);

    const encrypted = encryptAccountNumber(input.accountNumber);
    const created = await this.profileRepository.addBankAccount(auth.companyId, input.bankName, encrypted);

    return {
      id: created.id,
      bankName: created.bank_name,
      maskedAccountNumber: maskAccountNumber(input.accountNumber),
    };
  }

  async getDocuments(auth: AuthContext) {
    await this.profileRepository.ensureProfileContext(auth);

    const docs = await this.profileRepository.getDocuments(auth.companyId);

    return docs.map((doc) => ({
      id: doc.id,
      documentType: doc.document_type,
      status: doc.status,
      fileUrl: doc.file_url,
    }));
  }

  async uploadDocument(auth: AuthContext, input: AddDocumentInput) {
    await this.profileRepository.ensureProfileContext(auth);

    const fileBuffer = parseBase64Payload(input.fileBase64);

    if (fileBuffer.length === 0) {
      throw new AppError(400, 'Invalid document payload', 'INVALID_DOCUMENT_PAYLOAD');
    }

    let fileUrl = `local://documents/${sanitizeFileName(input.fileName)}`;

    if (isSupabaseConfigured && supabaseAdmin) {
      const storagePath = `${auth.companyId}/${Date.now()}-${sanitizeFileName(input.fileName)}`;

      const uploadResult = await supabaseAdmin.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: input.contentType,
          upsert: false,
        });

      if (uploadResult.error) {
        throw new AppError(500, 'Document upload failed', 'DOCUMENT_UPLOAD_FAILED', uploadResult.error.message);
      }

      const publicUrlResult = supabaseAdmin.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      fileUrl = publicUrlResult.data.publicUrl;
    }

    const created = await this.profileRepository.addDocument(auth.companyId, {
      documentType: input.documentType,
      fileUrl,
      status: 'Pending',
    });

    return {
      id: created.id,
      documentType: created.document_type,
      status: created.status,
      fileUrl: created.file_url,
    };
  }
}

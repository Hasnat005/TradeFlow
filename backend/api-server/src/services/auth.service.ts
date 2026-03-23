import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { AuthRepository } from '../repositories/auth.repository';
import { AppError } from '../utils/app-error';

type LoginInput = {
  email: string;
  password: string;
};

type BusinessType = 'Supplier' | 'Buyer / Distributor' | 'Exporter';

type RegisterInput = {
  companyName: string;
  businessType: BusinessType;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

type SignupInput = {
  companyName: string;
  businessType?: BusinessType;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  private createToken(userId: string, companyId: string) {
    return jwt.sign(
      {
        sub: userId,
        company_id: companyId,
      },
      env.JWT_SECRET,
      { expiresIn: '8h' },
    );
  }

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();

    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !user.password_hash) {
      throw new AppError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(input.password, user.password_hash);

    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const company = await this.authRepository.findCompanyByUserId(user.id);

    if (!company) {
      throw new AppError(404, 'Company account not found', 'AUTH_COMPANY_NOT_FOUND');
    }

    return {
      token: this.createToken(user.id, company.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      company: {
        id: company.id,
        companyName: company.company_name,
      },
    };
  }

  async register(input: RegisterInput) {
    const existing = await this.authRepository.findUserByEmail(input.email.trim().toLowerCase());

    if (existing) {
      throw new AppError(409, 'Email already registered', 'AUTH_EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const created = await this.authRepository.createUserWithCompany({
      email: input.email.trim().toLowerCase(),
      passwordHash: hashedPassword,
      companyName: input.companyName.trim(),
      businessType: input.businessType,
      phone: input.phone?.trim(),
      address: input.address?.trim(),
    });

    return {
      token: this.createToken(created.user.id, created.company.id),
      user: {
        id: created.user.id,
        name: created.user.name,
        email: created.user.email,
      },
      company: {
        id: created.company.id,
        companyName: created.company.company_name,
      },
    };
  }

  async signup(input: SignupInput) {
    return this.register({
      companyName: input.companyName,
      businessType: input.businessType ?? 'Buyer / Distributor',
      email: input.email,
      password: input.password,
      phone: input.phone,
      address: input.address,
    });
  }

  async forgotPassword(email: string) {
    const existing = await this.authRepository.findUserByEmail(email.trim().toLowerCase());

    return {
      sent: Boolean(existing),
      message: 'If the account exists, a password reset link has been sent.',
    };
  }
}

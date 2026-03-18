import { Request, Response } from 'express';

import { AuthService } from '../services/auth.service';

type BusinessType = 'Supplier' | 'Buyer / Distributor' | 'Exporter';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    const body = req.body as { email: string; password: string };
    const data = await this.authService.login(body);

    res.status(200).json({ success: true, data });
  }

  async register(req: Request, res: Response) {
    const body = req.body as {
      company_name: string;
      business_type: BusinessType;
      email: string;
      password: string;
      phone?: string;
      address?: string;
    };

    const data = await this.authService.register({
      companyName: body.company_name,
      businessType: body.business_type,
      email: body.email,
      password: body.password,
      phone: body.phone,
      address: body.address,
    });

    res.status(201).json({ success: true, data });
  }

  async signup(req: Request, res: Response) {
    const body = req.body as {
      companyName: string;
      businessType?: BusinessType;
      email: string;
      password: string;
      phone?: string;
      address?: string;
    };

    const data = await this.authService.signup({
      companyName: body.companyName,
      businessType: body.businessType,
      email: body.email,
      password: body.password,
      phone: body.phone,
      address: body.address,
    });

    res.status(201).json({ success: true, data });
  }

  async forgotPassword(req: Request, res: Response) {
    const body = req.body as { email: string };
    const data = await this.authService.forgotPassword(body.email);

    res.status(200).json({ success: true, data });
  }
}

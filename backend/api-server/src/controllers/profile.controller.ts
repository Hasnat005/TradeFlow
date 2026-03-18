import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  async getProfile(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const data = await this.profileService.getProfile(auth);

    res.status(200).json({ success: true, data });
  }

  async updateProfile(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const data = await this.profileService.updateProfile(auth, req.body);

    res.status(200).json({ success: true, data });
  }

  async changePassword(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as { currentPassword: string; newPassword: string };
    const data = await this.profileService.changePassword(auth, body.currentPassword, body.newPassword);

    res.status(200).json({ success: true, data });
  }

  async addBankAccount(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as { bankName: string; accountNumber: string };
    const data = await this.profileService.addBankAccount(auth, body);

    res.status(201).json({ success: true, data });
  }

  async getDocuments(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const data = await this.profileService.getDocuments(auth);

    res.status(200).json({ success: true, data });
  }
}

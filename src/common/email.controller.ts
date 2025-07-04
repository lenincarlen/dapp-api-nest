import { Controller, Post } from '@nestjs/common';
import { EmailService } from './services/email.service';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('test')
    async sendTestEmail() {
        return await this.emailService.sendTestEmail();
    }
} 
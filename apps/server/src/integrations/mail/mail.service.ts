import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAIL_DRIVER_TOKEN } from './mail.constants';
import { MailDriver } from './drivers/interfaces/mail-driver.interface';
import { MailMessage } from './interfaces/mail.message';
import { EnvironmentService } from '../environment/environment.service';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueName, QueueJob } from '../queue/constants';
import { Queue } from 'bullmq';
import { render } from '@react-email/render';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB } from '@notedoc/db/types/kysely.types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  
  constructor(
    @Inject(MAIL_DRIVER_TOKEN) private mailDriver: MailDriver,
    private readonly environmentService: EnvironmentService,
    @InjectQueue(QueueName.EMAIL_QUEUE) private emailQueue: Queue,
    @InjectKysely() private readonly db: KyselyDB,
  ) {}

  /**
   * Get mail configuration from database or fallback to environment variables
   */
  private async getMailConfig(workspaceId?: string): Promise<{
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUsername?: string;
    smtpPassword?: string;
    mailFromAddress: string;
    mailFromName: string;
    smtpIgnoreTLS?: boolean;
  }> {
    // Try to get config from database if workspaceId is provided
    if (workspaceId) {
      try {
        const workspace = await this.db
          .selectFrom('workspaces')
          .select('settings')
          .where('id', '=', workspaceId)
          .executeTakeFirst();

        const settings = workspace?.settings as any;
        const mailSettings = settings?.mail;

        if (mailSettings && mailSettings.smtpHost && mailSettings.smtpPort) {
          this.logger.debug(`Using mail config from database for workspace ${workspaceId}`);
          return {
            smtpHost: mailSettings.smtpHost,
            smtpPort: mailSettings.smtpPort,
            smtpSecure: mailSettings.smtpSecure || false,
            smtpUsername: mailSettings.smtpUsername,
            smtpPassword: mailSettings.smtpPassword,
            mailFromAddress: mailSettings.mailFromAddress || this.environmentService.getMailFromAddress(),
            mailFromName: mailSettings.mailFromName || this.environmentService.getMailFromName(),
            smtpIgnoreTLS: mailSettings.smtpIgnoreTLS,
          };
        }
      } catch (error: any) {
        this.logger.warn(`Failed to get mail config from database: ${error?.message || error}`);
      }
    }

    // Fallback to environment variables
    this.logger.debug('Using mail config from environment variables');
    return {
      smtpHost: this.environmentService.getSmtpHost(),
      smtpPort: this.environmentService.getSmtpPort(),
      smtpSecure: this.environmentService.getSmtpSecure(),
      smtpUsername: this.environmentService.getSmtpUsername(),
      smtpPassword: this.environmentService.getSmtpPassword(),
      mailFromAddress: this.environmentService.getMailFromAddress(),
      mailFromName: this.environmentService.getMailFromName(),
      smtpIgnoreTLS: this.environmentService.getSmtpIgnoreTLS(),
    };
  }

  async sendEmail(message: MailMessage, workspaceId?: string): Promise<void> {
    this.logger.debug(`sendEmail called with workspaceId: ${workspaceId}, to: ${message.to}`);
    
    if (message.template) {
      // in case this method is used directly. we do not send the tsx template from queue
      message.html = await render(message.template, {
        pretty: true,
      });
      message.text = await render(message.template, { plainText: true });
    }

    // Get mail config (from database or environment)
    const mailConfig = await this.getMailConfig(workspaceId);
    this.logger.debug(`Mail config: host=${mailConfig.smtpHost}, port=${mailConfig.smtpPort}, hasAuth=${!!(mailConfig.smtpUsername && mailConfig.smtpPassword)}`);

    // If database config is available, use it to send email
    if (workspaceId && mailConfig.smtpHost) {
      const nodemailer = require('nodemailer');
      
      const transportConfig: any = {
        host: mailConfig.smtpHost,
        port: mailConfig.smtpPort,
        secure: mailConfig.smtpSecure,
      };

      if (mailConfig.smtpUsername && mailConfig.smtpPassword) {
        transportConfig.auth = {
          user: mailConfig.smtpUsername,
          pass: mailConfig.smtpPassword,
        };
      }

      if (mailConfig.smtpIgnoreTLS !== undefined) {
        transportConfig.ignoreTLS = mailConfig.smtpIgnoreTLS;
      }

      const transporter = nodemailer.createTransport(transportConfig);

      let from = mailConfig.mailFromAddress;
      if (message.from) {
        from = message.from;
      }

      const sender = `${mailConfig.mailFromName} <${from}>`;
      
      await transporter.sendMail({
        from: sender,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      
      return;
    }

    // Fallback to default mail driver (environment config)
    let from = this.environmentService.getMailFromAddress();
    if (message.from) {
      from = message.from;
    }

    const sender = `${this.environmentService.getMailFromName()} <${from}> `;
    await this.mailDriver.sendMail({ from: sender, ...message });
  }

  async sendToQueue(message: MailMessage, workspaceId?: string): Promise<void> {
    if (message.template) {
      // transform the React object because it gets lost when sent via the queue
      message.html = await render(message.template, {
        pretty: true,
      });
      message.text = await render(message.template, {
        plainText: true,
      });
      delete message.template;
    }
    await this.emailQueue.add(QueueJob.SEND_EMAIL, { ...message, workspaceId });
  }

  async sendTestEmail(
    toEmail: string,
    customSettings?: Record<string, any>,
  ): Promise<void> {
    const nodemailer = require('nodemailer');

    const config = customSettings || {
      host: this.environmentService.getSmtpHost(),
      port: this.environmentService.getSmtpPort(),
      secure: this.environmentService.getSmtpSecure(),
      auth: {
        user: this.environmentService.getSmtpUsername(),
        pass: this.environmentService.getSmtpPassword(),
      },
      ignoreTLS: this.environmentService.getSmtpIgnoreTLS(),
    };

    const transportConfig: any = {
      host: config.smtpHost || config.host,
      port: config.smtpPort || config.port,
      secure:
        config.smtpSecure !== undefined ? config.smtpSecure : config.secure,
    };

    if (config.smtpUsername || config.auth?.user) {
      transportConfig.auth = {
        user: config.smtpUsername || config.auth?.user,
        pass: config.smtpPassword || config.auth?.pass,
      };
    }

    if (config.smtpIgnoreTLS !== undefined) {
      transportConfig.ignoreTLS = config.smtpIgnoreTLS;
    } else if (config.ignoreTLS !== undefined) {
      transportConfig.ignoreTLS = config.ignoreTLS;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const fromAddress =
      config.mailFromAddress || this.environmentService.getMailFromAddress();
    const fromName =
      config.mailFromName || this.environmentService.getMailFromName();
    const from = `${fromName} <${fromAddress}>`;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'NoteDoc 邮件服务测试',
      text: '这是一封测试邮件，用于验证您的 SMTP 配置是否正确。如果您收到此邮件，说明邮件服务配置成功！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">NoteDoc 邮件服务测试</h2>
          <p>这是一封测试邮件，用于验证您的 SMTP 配置是否正确。</p>
          <p>如果您收到此邮件，说明邮件服务配置成功！</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">此邮件由 NoteDoc 系统自动发送，请勿回复。</p>
        </div>
      `,
    });
  }
}

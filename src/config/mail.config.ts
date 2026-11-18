import { ConfigService } from '@nestjs/config';
import {
  MailModuleAsyncOptions,
  SmtpTransport,
  FileTemplateEngine,
} from '@nestjs/mail';
import { join } from 'path';

export const MailOptions: MailModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (cfg: ConfigService) => ({
    transport: new SmtpTransport({
      host: cfg.getOrThrow<string>('SMTP_HOST'),
      port: parseInt(cfg.getOrThrow<string>('SMTP_PORT')),
      secure: false,
      auth: {
        user: cfg.getOrThrow<string>('SMTP_USERNAME'),
        pass: cfg.getOrThrow<string>('SMTP_PASSWORD'),
      },
    }),
    templates: new FileTemplateEngine({
      dir: join(import.meta.dirname, '../mail/templates'),
    }),
    from: 'Accounts <accounts@demomailtrap.co>',
  }),
};

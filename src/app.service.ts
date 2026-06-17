import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  getHello(): string {
    // Resolves the active language from the request context
    // (query ?lang=, x-lang header, or Accept-Language).
    return this.i18n.t('app.HELLO');
  }

  greet(name: string): string {
    return this.i18n.t('app.GREETING', { args: { name } });
  }
}

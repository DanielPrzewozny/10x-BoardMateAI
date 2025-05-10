import { type Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // Selektory dla formularza logowania
  private readonly emailInput = '#email';
  private readonly passwordInput = '#password';
  private readonly submitButton = 'button[type="submit"]';
  private readonly errorAlert = '[role="alert"]';

  async goto() {
    await this.page.goto('/auth/login');
    // Czekamy na załadowanie formularza
    await this.page.waitForSelector('form');
  }

  async login(email: string, password: string) {
    // Wypełnij formularz
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    
    // Kliknij przycisk logowania
    await this.page.click(this.submitButton);
    
    // Czekaj na przekierowanie i załadowanie nowej strony
    await this.page.waitForLoadState('networkidle');
  }

  async getErrorMessage() {
    const alert = await this.page.locator(this.errorAlert);
    return alert.textContent();
  }
} 
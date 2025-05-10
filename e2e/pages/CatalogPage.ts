import { type Page } from '@playwright/test';

export class CatalogPage {
  constructor(private page: Page) {}

  // Selektory
  private readonly gamesList = '[data-testid="game-catalog"]';
  private readonly gameCard = '[data-testid*="game-card-"]';
  private readonly gameTitle = '[data-testid="game-title"]';

  async goto() {
    await this.page.goto('/games');
  }

  async waitForGames() {
    await this.page.waitForSelector(this.gamesList);
    await this.page.waitForSelector(this.gameCard);
  }

  async getGamesCount() {
    return await this.page.locator(this.gameCard).count();
  }

  async getGameTitles() {
    return await this.page.locator(this.gameTitle).allTextContents();
  }
} 
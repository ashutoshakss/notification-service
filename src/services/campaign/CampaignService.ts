import postgres from 'postgres';
import { Campaign, CreateCampaignDTO } from '../../types/campaign';
import { config } from '../../config';

export class CampaignService {
  private sql: postgres.Sql;

  constructor() {
    this.sql = postgres(config.database.postgres);
  }

  async createCampaign(data: CreateCampaignDTO): Promise<Campaign> {
    const [campaign] = await this.sql<Campaign[]>`
      INSERT INTO campaigns (
        name, description, template_id, segment, 
        schedule, status, metrics
      ) VALUES (
        ${data.name}, ${data.description}, ${data.templateId},
        ${JSON.stringify(data.segment)}, ${JSON.stringify(data.schedule)},
        'draft', ${JSON.stringify({ sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 })}
      )
      RETURNING *
    `;

    return campaign;
  }

  async updateCampaign(campaignId: string, data: Partial<CreateCampaignDTO>): Promise<Campaign> {
    const [campaign] = await this.sql<Campaign[]>`
      UPDATE campaigns 
      SET ${this.sql(data)}
      WHERE id = ${campaignId}
      RETURNING *
    `;

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign;
  }

  async scheduleCampaign(campaignId: string, schedule: Campaign['schedule']): Promise<Campaign> {
    const [campaign] = await this.sql<Campaign[]>`
      UPDATE campaigns 
      SET schedule = ${JSON.stringify(schedule)},
          status = 'scheduled'
      WHERE id = ${campaignId}
      RETURNING *
    `;

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign;
  }

  async getCampaignAnalytics(campaignId: string): Promise<Campaign['metrics']> {
    const [campaign] = await this.sql<Campaign[]>`
      SELECT metrics FROM campaigns 
      WHERE id = ${campaignId}
    `;

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign.metrics;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await this.sql<Campaign[]>`
      SELECT * FROM campaigns 
      ORDER BY created_at DESC
    `;
  }
} 
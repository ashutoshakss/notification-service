import { Elysia } from 'elysia';
import { CampaignService } from '../../services/campaign/CampaignService';
import { CreateCampaignDTO } from '../../types/campaign';

export function setupCampaignRoutes(app: Elysia) {
  const campaignService = new CampaignService();

  return app.group('/api/v1/campaigns', (app) => 
    app
      .post('/', async ({ body }) => {
        const data = body as CreateCampaignDTO;
        return await campaignService.createCampaign(data);
      }, {
        detail: {
          tags: ['Campaigns'],
          summary: 'Create campaign',
          description: 'Create a new notification campaign'
        }
      })
      
      .get('/', async () => {
        return await campaignService.getCampaigns();
      }, {
        detail: {
          tags: ['Campaigns'],
          summary: 'List campaigns',
          description: 'Get all notification campaigns'
        }
      })
      
      .get('/:campaignId', async ({ params: { campaignId } }) => {
        return await campaignService.getCampaignById(campaignId);
      }, {
        detail: {
          tags: ['Campaigns'],
          summary: 'Get campaign',
          description: 'Get a specific campaign by ID'
        }
      })
      
      .put('/:campaignId', async ({ params: { campaignId }, body }) => {
        return await campaignService.updateCampaign(campaignId, body);
      }, {
        detail: {
          tags: ['Campaigns'],
          summary: 'Update campaign',
          description: 'Update an existing campaign'
        }
      })
      
      .post('/:campaignId/schedule', async ({ params: { campaignId }, body }) => {
        const { schedule } = body;
        return await campaignService.scheduleCampaign(campaignId, schedule);
      }, {
        detail: {
          tags: ['Campaigns'],
          summary: 'Schedule campaign',
          description: 'Schedule a campaign for delivery'
        }
      })
      
      .get('/:campaignId/analytics', async ({ params: { campaignId } }) => {
        return await campaignService.getCampaignAnalytics(campaignId);
      }, {
        detail: {
          tags: ['Campaigns'],
          summary: 'Campaign analytics',
          description: 'Get analytics for a specific campaign'
        }
      })
  );
} 
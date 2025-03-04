import { Elysia } from 'elysia';
import { TemplateService } from '../../services/template/TemplateService';
import { CreateTemplateDTO } from '../../types/template';

export function setupTemplateRoutes(app: Elysia) {
  const templateService = new TemplateService();

  return app.group('/api/v1/templates', (app) => 
    app
      .post('/', async ({ body }) => {
        const data = body as CreateTemplateDTO;
        return await templateService.createTemplate(data);
      }, {
        detail: {
          tags: ['Templates'],
          summary: 'Create template',
          description: 'Create a new notification template'
        }
      })
      
      .get('/', async () => {
        return await templateService.getTemplates();
      }, {
        detail: {
          tags: ['Templates'],
          summary: 'List templates',
          description: 'Get all notification templates'
        }
      })
      
      .get('/:templateId', async ({ params: { templateId } }) => {
        return await templateService.getTemplateById(templateId);
      }, {
        detail: {
          tags: ['Templates'],
          summary: 'Get template',
          description: 'Get a specific template by ID'
        }
      })
      
      .put('/:templateId', async ({ params: { templateId }, body }) => {
        return await templateService.updateTemplate(templateId, body);
      }, {
        detail: {
          tags: ['Templates'],
          summary: 'Update template',
          description: 'Update an existing template'
        }
      })
      
      .put('/:templateId/status', async ({ params: { templateId }, body }) => {
        const { status } = body;
        return await templateService.updateTemplateStatus(templateId, status);
      }, {
        detail: {
          tags: ['Templates'],
          summary: 'Update template status',
          description: 'Update the status of a template'
        }
      })
  );
} 
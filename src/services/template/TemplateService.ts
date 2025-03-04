import postgres from 'postgres';
import { createClient } from 'redis';
import { Template, CreateTemplateDTO, TemplateVersion } from '../../types/template';
import { config } from '../../config';

export class TemplateService {
  private sql: postgres.Sql;
  private redis: ReturnType<typeof createClient>;

  constructor() {
    this.sql = postgres(config.database.postgres);
    this.redis = createClient({
      url: config.database.redis.url
    });
    this.initRedis();
  }

  private async initRedis() {
    await this.redis.connect();
  }

  async createTemplate(data: CreateTemplateDTO): Promise<Template> {
    const [template] = await this.sql<Template[]>`
      INSERT INTO templates (
        name, description, type, content, 
        variables, status, locale
      ) VALUES (
        ${data.name}, ${data.description}, ${data.type},
        ${JSON.stringify(data.content)}, ${data.variables || []},
        ${data.status}, ${data.locale}
      )
      RETURNING *
    `;

    await this.createTemplateVersion(template.id, template.content);
    return template;
  }

  async updateTemplate(templateId: string, data: Partial<CreateTemplateDTO>): Promise<Template> {
    if (data.content) {
      const [currentTemplate] = await this.sql<Template[]>`
        SELECT content FROM templates WHERE id = ${templateId}
      `;
      
      if (currentTemplate) {
        data.content = {
          ...currentTemplate.content,
          ...data.content
        };
      }
    }

    const [template] = await this.sql<Template[]>`
      UPDATE templates 
      SET ${this.sql(data)}
      WHERE id = ${templateId}
      RETURNING *
    `;

    if (!template) {
      throw new Error('Template not found');
    }

    if (data.content) {
      await this.createTemplateVersion(template.id, data.content);
    }

    return template;
  }

  private async createTemplateVersion(templateId: string, content: Template['content']): Promise<TemplateVersion> {
    const [version] = await this.sql<TemplateVersion[]>`
      INSERT INTO template_versions (
        template_id, content
      ) VALUES (
        ${templateId}, ${JSON.stringify(content)}
      )
      RETURNING *
    `;

    return version;
  }

  async updateTemplateStatus(templateId: string, status: Template['status']): Promise<Template> {
    const [template] = await this.sql<Template[]>`
      UPDATE templates 
      SET status = ${status}
      WHERE id = ${templateId}
      RETURNING *
    `;

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async getTemplateById(templateId: string): Promise<Template> {
    const [template] = await this.sql<Template[]>`
      SELECT * FROM templates 
      WHERE id = ${templateId}
    `;

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async getTemplates(): Promise<Template[]> {
    return await this.sql<Template[]>`
      SELECT * FROM templates 
      ORDER BY created_at DESC
    `;
  }
} 
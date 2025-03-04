export interface TemplateContent {
  title?: string;
  body?: string;
  html?: string;
  sendgridTemplateId?: string;
  data?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'push' | 'email' | 'sms' | 'in-app';
  content: TemplateContent;
  variables?: string[];
  status: 'draft' | 'active' | 'inactive';
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  content: Template['content'];
  createdAt: Date;
}

export interface CreateTemplateDTO {
  name: string;
  description?: string;
  type: Template['type'];
  content: TemplateContent;
  variables?: string[];
  status: Template['status'];
  locale: string;
} 
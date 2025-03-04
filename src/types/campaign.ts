export interface Campaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  segment: {
    filters: Record<string, any>;
    estimatedReach?: number;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  templateId: string;
  segment: Campaign['segment'];
  schedule: Campaign['schedule'];
} 
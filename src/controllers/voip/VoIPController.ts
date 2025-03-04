import { Elysia } from 'elysia';
import { VoIPService } from '../../services/voip/VoIPService';

export function setupVoIPRoutes(app: Elysia) {
  const voipService = new VoIPService();

  return app.group('/api/v1/voip', (app) => 
    app
      .post('/call', async ({ body }) => {
        const { callerId, deviceId } = body;
        return await voipService.initiateCall(callerId, deviceId);
      }, {
        detail: {
          tags: ['VoIP'],
          summary: 'Initiate call',
          description: 'Start a new VoIP call'
        }
      })
      
      .post('/call/:callId/answer', async ({ params: { callId }, body }) => {
        const { answer } = body;
        await voipService.handleCallAnswer(callId, answer);
        return { success: true };
      }, {
        detail: {
          tags: ['VoIP'],
          summary: 'Answer call',
          description: 'Handle call answer with WebRTC answer'
        }
      })
      
      .post('/call/:callId/ice-candidate', async ({ params: { callId }, body }) => {
        const { candidate } = body;
        await voipService.handleIceCandidate(callId, candidate);
        return { success: true };
      })
      
      .post('/call/:callId/end', async ({ params: { callId } }) => {
        await voipService.endCall(callId);
        return { success: true };
      })
  );
} 
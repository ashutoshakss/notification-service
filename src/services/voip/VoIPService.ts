import postgres from 'postgres';
import * as apn from 'node-apn';
import { VoIPCall, VoIPPushPayload } from '../../types/voip';
import { config } from '../../config';
import { WebRTCService } from './WebRTCService';

export class VoIPService {
  private sql: postgres.Sql;
  private apnProvider: apn.Provider;
  private webrtcService: WebRTCService;

  constructor() {
    this.sql = postgres(config.database.postgres);
    
    // Initialize APN provider specifically for VoIP
    this.apnProvider = new apn.Provider({
      token: {
        key: config.voip.apns.key,
        keyId: config.voip.apns.keyId,
        teamId: config.voip.apns.teamId
      },
      production: config.voip.apns.production
    });
    
    this.webrtcService = new WebRTCService();
  }

  async initiateCall(callerId: string, deviceId: string): Promise<VoIPCall> {
    // Create a new call record
    const [call] = await this.sql<VoIPCall[]>`
      INSERT INTO voip_calls (
        user_id, device_id, status,
        webrtc_data
      ) VALUES (
        ${callerId}, ${deviceId}, 'initiating',
        ${JSON.stringify({ roomId: this.webrtcService.createRoom(), candidates: [] })}
      )
      RETURNING *
    `;

    // Get device VoIP push token
    const [device] = await this.sql`
      SELECT voip_push_token FROM devices 
      WHERE id = ${deviceId}
    `;

    if (!device?.voip_push_token) {
      throw new Error('Device has no VoIP push token registered');
    }

    // Send VoIP push notification
    const pushPayload: VoIPPushPayload = {
      callId: call.id,
      type: 'incoming_call',
      caller: {
        id: callerId,
        name: 'System Call' // Or fetch actual caller name
      },
      webrtcData: {
        roomId: call.webrtcData.roomId,
        serverUrl: config.voip.webrtc.serverUrl
      }
    };

    const notification = new apn.Notification({
      topic: `${config.voip.apns.bundleId}.voip`,
      payload: pushPayload,
      pushType: 'voip'
    });

    try {
      const result = await this.apnProvider.send(notification, device.voip_push_token);
      if (result.failed.length > 0) {
        throw new Error(result.failed[0].response?.reason || 'Push notification failed');
      }
    } catch (error) {
      await this.updateCallStatus(call.id, 'failed');
      throw error;
    }

    return call;
  }

  async handleCallAnswer(callId: string, answer: RTCSessionDescription): Promise<void> {
    await this.sql`
      UPDATE voip_calls 
      SET 
        status = 'connected',
        start_time = CURRENT_TIMESTAMP,
        webrtc_data = jsonb_set(
          webrtc_data::jsonb,
          '{answer}',
          ${JSON.stringify(answer)}::jsonb
        )
      WHERE id = ${callId}
    `;
  }

  async handleIceCandidate(callId: string, candidate: RTCIceCandidate): Promise<void> {
    await this.sql`
      UPDATE voip_calls 
      SET webrtc_data = jsonb_set(
        webrtc_data::jsonb,
        '{candidates}',
        (
          SELECT jsonb_agg(elem)
          FROM (
            SELECT jsonb_array_elements(webrtc_data->'candidates') AS elem
            UNION ALL
            SELECT ${JSON.stringify(candidate)}::jsonb
          ) sub
        )
      )
      WHERE id = ${callId}
    `;
  }

  async endCall(callId: string): Promise<void> {
    await this.sql`
      UPDATE voip_calls 
      SET 
        status = 'completed',
        end_time = CURRENT_TIMESTAMP,
        duration = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time))
      WHERE id = ${callId}
    `;

    // Cleanup WebRTC room
    const [call] = await this.sql<VoIPCall[]>`
      SELECT * FROM voip_calls WHERE id = ${callId}
    `;
    
    if (call) {
      await this.webrtcService.closeRoom(call.webrtcData.roomId);
    }
  }

  private async updateCallStatus(callId: string, status: VoIPCall['status']): Promise<void> {
    await this.sql`
      UPDATE voip_calls 
      SET status = ${status}
      WHERE id = ${callId}
    `;
  }
} 
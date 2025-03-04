import { NotificationProvider, ProviderConfig, ProviderResponse } from '../../types/provider';
import * as admin from 'firebase-admin';
import { Notification } from 'node-apn';
import { Twilio } from 'twilio';
import nodemailer from 'nodemailer';
import { config } from '../../config';
import { SendGridProvider } from './email/SendGridProvider';
import { SMTPProvider } from './email/SMTPProvider';
import { FCMProvider } from './push/FCMProvider';
import { APNSProvider } from './push/APNSProvider';
import { TwilioSMSProvider } from './sms/TwilioSMSProvider';

export class NotificationProviderFactory {
  private static instance: NotificationProviderFactory;
  private emailProvider: SendGridProvider;
  private smtpProvider: SMTPProvider;
  private fcmProvider: FCMProvider;
  private apnsProvider: APNSProvider;
  private smsProvider: TwilioSMSProvider;

  private constructor() {
    this.emailProvider = new SendGridProvider();
    this.smtpProvider = new SMTPProvider();
    this.fcmProvider = new FCMProvider();
    this.apnsProvider = new APNSProvider();
    this.smsProvider = new TwilioSMSProvider();
  }

  public static getInstance(): NotificationProviderFactory {
    if (!NotificationProviderFactory.instance) {
      NotificationProviderFactory.instance = new NotificationProviderFactory();
    }
    return NotificationProviderFactory.instance;
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
    templateId?: string,
    templateData?: Record<string, any>
  ) {
    // Default to SendGrid
    return await this.emailProvider.sendEmail(to, subject, body, html, templateId, templateData);
  }

  async sendSMTPEmail(to: string, subject: string, body: string, html?: string) {
    return await this.smtpProvider.sendEmail(to, subject, body, html);
  }

  async sendPushNotification(
    provider: 'fcm' | 'apns',
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    if (provider === 'fcm') {
      return await this.fcmProvider.sendPushNotification(token, title, body, data);
    } else {
      return await this.apnsProvider.sendPushNotification(token, title, body, data);
    }
  }

  async sendSMS(to: string, message: string) {
    return await this.smsProvider.sendSMS(to, message);
  }
} 
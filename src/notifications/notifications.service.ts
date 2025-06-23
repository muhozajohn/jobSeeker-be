import { SendEmailService } from '../send-email/send-email.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionStatus } from '@prisma/client';
import { conflictError } from 'src/utils/response.utils';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sendEmailService: SendEmailService
  ) { }

  async createConnectionRequest(
    recruiterId: number,
    workerId: number,
    message?: string
  ) {
    // Check if request already exists
    const existingRequest = await this.prisma.connectionRequest.findFirst({
      where: {
        recruiterId,
        workerId,
        status: {
          not: ConnectionStatus.CANCELLED
        }
      }
    });

    if (existingRequest) {
      return conflictError('Connection request already exists');
    }

    // Create new request
    const connectionRequest = await this.prisma.connectionRequest.create({
      data: {
        recruiterId,
        workerId,
        message,
        status: ConnectionStatus.PENDING
      },
      include: {
        recruiter: {
          include: {
            user: true
          }
        },
        worker: {
          include: {
            user: true
          }
        }
      }
    });

    // Get all admin users to notify
    const admins = await this.prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    });

    // Send notifications
    await Promise.all(
      admins.map(admin =>
        this.sendEmailService.notifyAdminAboutRecruiterInterest(
          admin.email,
          `${admin.firstName} ${admin.lastName}`,
          connectionRequest.recruiter,
          connectionRequest.worker,
          connectionRequest.message ?? undefined
        )
      )
    );

    return connectionRequest;
  }

  async getConnectionRequests(filter: {
    recruiterId?: number;
    workerId?: number;
    status?: ConnectionStatus;
  }) {
    return this.prisma.connectionRequest.findMany({
      where: filter,
      include: {
        recruiter: {
          include: {
            user: true
          }
        },
        worker: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async updateConnectionStatus(
    requestId: number,
    status: ConnectionStatus,
    adminNotes?: string
  ) {
    const updatedRequest = await this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes,
        updatedAt: new Date()
      },
      include: {
        recruiter: {
          include: {
            user: true
          }
        },
        worker: {
          include: {
            user: true
          }
        }
      }
    });

    // Send approval notifications if status was changed to APPROVED
    if (status === ConnectionStatus.APPROVED) {
      await this.sendApprovalNotifications({
        ...updatedRequest,
        message: updatedRequest.message ?? undefined
      });
    }

    // Optionally: Send rejection notifications if status was changed to REJECTED
    if (status === ConnectionStatus.REJECTED) {
      await this.sendRejectionNotifications(updatedRequest, adminNotes);
    }

    return updatedRequest;
  }

  private async sendApprovalNotifications(
    connectionRequest: {
      recruiter: {
        user: {
          email: string;
          firstName: string;
          lastName: string;
        };
        companyName: string | null;
      };
      worker: {
        user: {
          email: string;
          firstName: string;
          lastName: string;
        };
      };
      message?: string;
    }
  ) {
    // Send email to recruiter
    await this.sendEmailService.sendMail({
      emailTo: connectionRequest.recruiter.user.email,
      subject: `Connection Approved: ${connectionRequest.worker.user.firstName} ${connectionRequest.worker.user.lastName}`,
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">Connection Approved!</h1>
          <p>Hello ${connectionRequest.recruiter.user.firstName},</p>
          <p>Your connection request to <strong>${connectionRequest.worker.user.firstName} ${connectionRequest.worker.user.lastName}</strong> has been approved by the admin.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #4a6bff;">Next Steps</h3>
              <ul>
                  <li>Contact the worker to discuss details</li>
                  <li>Create a job posting if needed</li>
                  <li>Manage your connection through your dashboard</li>
              </ul>
              ${connectionRequest.message ? `
              <div style="margin-top: 15px; padding: 10px; background-color: #fff; border-left: 3px solid #4a6bff;">
                  <p><strong>Your original message:</strong></p>
                  <p style="font-style: italic;">"${connectionRequest.message}"</p>
              </div>
              ` : ''}
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL}/" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 View Connection
              </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              Best regards,<br>
              <strong>The CareBridge Team</strong>
          </p>
      </div>
      `
    });

    // Send email to worker
    await this.sendEmailService.sendMail({
      emailTo: connectionRequest.worker.user.email,
      subject: `New Connection: ${connectionRequest.recruiter.user.firstName} ${connectionRequest.recruiter.user.lastName} from ${connectionRequest.recruiter.companyName || 'a company'}`,
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">New Connection Approved!</h1>
          <p>Hello ${connectionRequest.worker.user.firstName},</p>
          <p>You have been connected with <strong>${connectionRequest.recruiter.user.firstName} ${connectionRequest.recruiter.user.lastName}</strong> from <strong>${connectionRequest.recruiter.companyName || 'a company'}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #4a6bff;">What This Means</h3>
              <ul>
                  <li>The recruiter may contact you about potential opportunities</li>
                  <li>You can view their details in your connections</li>
                  <li>You're not obligated to accept any specific offer</li>
              </ul>
              ${connectionRequest.message ? `
              <div style="margin-top: 15px; padding: 10px; background-color: #fff; border-left: 3px solid #4a6bff;">
                  <p><strong>Recruiter's message:</strong></p>
                  <p style="font-style: italic;">"${connectionRequest.message}"</p>
              </div>
              ` : ''}
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/worker/connections" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 View Connection
              </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              Best regards,<br>
              <strong>The CareBridge Team</strong>
          </p>
      </div>
      `
    });
  }

  private async sendRejectionNotifications(
    connectionRequest: {
      recruiter: {
        user: {
          email: string;
          firstName: string;
          lastName: string;
        };
      };
      worker: {
        user: {
          email: string;
          firstName: string;
          lastName: string;
        };
      };
    },
    adminNotes?: string
  ) {
    // Send email to recruiter
    await this.sendEmailService.sendMail({
      emailTo: connectionRequest.recruiter.user.email,
      subject: `Connection Request Not Approved`,
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">Connection Not Approved</h1>
          <p>Hello ${connectionRequest.recruiter.user.firstName},</p>
          <p>We regret to inform you that your connection request to <strong>${connectionRequest.worker.user.firstName} ${connectionRequest.worker.user.lastName}</strong> was not approved by the admin.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              ${adminNotes ? `
              <div style="margin-bottom: 15px;">
                  <h3 style="color: #4a6bff;">Admin Notes</h3>
                  <p style="font-style: italic;">"${adminNotes}"</p>
              </div>
              ` : ''}
              <h3 style="color: #4a6bff;">Next Steps</h3>
              <ul>
                  <li>You may browse other qualified workers</li>
                  <li>Consider adjusting your search criteria</li>
                  <li>Contact support if you have questions</li>
              </ul>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL}/" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 Browse Workers
              </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              Best regards,<br>
              <strong>The CareBridge Team</strong>
          </p>
      </div>
      `
    });
  }
}
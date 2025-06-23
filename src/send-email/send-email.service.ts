import { Injectable } from '@nestjs/common';
import { Recruiter , Worker } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.UserMailer,
        pass: process.env.PasswordMailer,
      },
    });
  }

  async sendMail(emailTemplate: { 
    emailTo: string; 
    subject: string; 
    message: string 
  }): Promise<void> {
    const { emailTo, subject, message } = emailTemplate;
    
    const mailOptions = {
      from: process.env.UserMailer,
      to: emailTo,
      subject,
      html: message,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + mailOptions.to, info.response);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmailToAdmin(email: string, name: string): Promise<void> {
    const emailTemplate = {
      emailTo: email,
      subject: "Welcome to CareBridge - Admin Access Granted!",
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">Welcome Admin ${name}!</h1>
          <p>Congratulations! You have been granted administrative access to CareBridge platform.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333;">Your Admin Privileges Include:</h3>
              <ul>
                  <li>✅ Manage all users (Recruiters & Workers)</li>
                  <li>✅ Oversee job postings and applications</li>
                  <li>✅ Access system analytics and reports</li>
                  <li>✅ Manage platform settings and configurations</li>
                  <li>✅ Monitor work assignments and activities</li>
              </ul>
          </div>
          
          <p>As an administrator, you play a crucial role in maintaining the quality and integrity of our platform. We trust you to help create the best experience for both recruiters and workers.</p>
          
          <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/admin" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 Access Admin Dashboard
              </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <br/>
          <p>Best regards,<br/>
          <strong>The CareBridge Team</strong></p>
      </div>`,
    };

    await this.sendMail(emailTemplate);
  }

  async sendWelcomeEmailToRecruiter(
    email: string, 
    name: string, 
    recruiterType: 'COMPANY' | 'GROUP' | 'INDIVIDUAL' = 'INDIVIDUAL'
  ): Promise<void> {
    const typeText = {
      'COMPANY': 'Company Recruiter',
      'GROUP': 'Group Recruiter', 
      'INDIVIDUAL': 'Individual Recruiter'
    };

    const emailTemplate = {
      emailTo: email,
      subject: "Welcome to CareBridge - Start Finding Top Talent!",
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">Welcome ${name}!</h1>
          <p>Thank you for joining CareBridge as a <strong>${typeText[recruiterType]}</strong>. You're now part of a platform that connects you with qualified workers across various industries.</p>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #1976d2;">What You Can Do:</h3>
              <ul>
                  <li>🔍 <strong>Post Jobs</strong> - Create detailed job listings for various categories</li>
                  <li>👥 <strong>Find Workers</strong> - Browse and connect with skilled professionals</li>
                  <li>📋 <strong>Manage Applications</strong> - Review and respond to job applications</li>
                  <li>⏰ <strong>Schedule Work</strong> - Assign and track work assignments</li>
                  <li>💼 <strong>Build Your Profile</strong> - Showcase your company and opportunities</li>
              </ul>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p><strong>Next Steps:</strong></p>
              <p>1. Complete your recruiter profile<br/>
              2. Get verified to build trust with workers<br/>
              3. Post your first job listing</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/recruiter" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600; margin-right: 10px;">
                 Get Started
              </a>
              <a href="${process.env.FRONTEND_URL}/profile" 
                 style="background-color:#28a745; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 Complete Profile
              </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
              Need help getting started? Check out our recruiter guide or contact our support team.
          </p>
          
          <br/>
          <p>Best of luck with your hiring!<br/>
          <strong>The CareBridge Team</strong></p>
      </div>`,
    };

    await this.sendMail(emailTemplate);
  }

  async sendWelcomeEmailToWorker(email: string, name: string): Promise<void> {
    const emailTemplate = {
      emailTo: email,
      subject: "Welcome to CareBridge - Your Next Opportunity Awaits!",
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">Welcome ${name}!</h1>
          <p>Congratulations on joining CareBridge! You're now part of a community where skilled professionals like you connect with great job opportunities.</p>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #155724;">Your Journey Starts Here:</h3>
              <ul>
                  <li>🎯 <strong>Find Jobs</strong> - Browse opportunities in various categories</li>
                  <li>📝 <strong>Apply Easily</strong> - Submit applications with just a few clicks</li>
                  <li>💼 <strong>Manage Work</strong> - Track your applications and assignments</li>
                  <li>⭐ <strong>Build Reputation</strong> - Showcase your skills and experience</li>
                  <li>💰 <strong>Flexible Work</strong> - Choose from hourly, daily, or long-term opportunities</li>
              </ul>
          </div>
          
          <div style="background-color: #cce5ff; padding: 15px; border-radius: 8px;">
              <p><strong>Pro Tips for Success:</strong></p>
              <p>• Complete your profile with skills and experience<br/>
              • Upload your resume to stand out<br/>
              • Set your availability status<br/>
              • Apply to jobs that match your skills</p>
          </div>
          
          
          <p style="color: #666; font-size: 14px;">
              Ready to get started? Your next great opportunity is just a click away!
          </p>
          
          <br/>
          <p>Best of luck in your job search!<br/>
          <strong>The CareBridge Team</strong></p>
      </div>`,
    };

    await this.sendMail(emailTemplate);
  }

  async sendSubscriptionWelcomeEmail(email: string, name: string = ''): Promise<void> {
    const emailTemplate = {
      emailTo: email,
      subject: "Thank You for Subscribing to CareBridge Updates!",
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">Thank You${name ? ` ${name}` : ''}!</h1>
          <p>You've successfully subscribed to CareBridge updates. We'll keep you informed about the latest features, job opportunities, and platform improvements.</p>
          
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4a6bff;">
              <h3 style="color: #333; margin-top: 0;">What to Expect:</h3>
              <ul style="color: #555;">
                  <li>📧 Weekly job market insights and trends</li>
                  <li>🚀 New feature announcements and updates</li>
                  <li>💡 Tips for job seekers and recruiters</li>
                  <li>🎉 Special promotions and early access opportunities</li>
                  <li>📊 Industry reports and success stories</li>
              </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin-bottom: 20px;">Ready to join our community?</p>
              <a href="${process.env.FRONTEND_URL}/register" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600; margin-right: 10px;">
                 Create Account
              </a>
              <a href="${process.env.FRONTEND_URL}/jobs" 
                 style="background-color:#28a745; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 Browse Jobs
              </a>
          </div>
          
          <div style="background-color: #fff8dc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856508; font-size: 14px;">
                  <strong>Stay Connected:</strong> Follow us on social media for daily updates and job alerts!
              </p>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
              You can unsubscribe from these emails at any time by clicking 
              <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #4a6bff;">here</a>.
          </p>
          
          <br/>
          <p>Stay tuned for exciting updates!<br/>
          <strong>The CareBridge Team</strong></p>
      </div>`,
    };

    await this.sendMail(emailTemplate);
  }

  async sendJobApplicationNotification(
    recruiterEmail: string, 
    recruiterName: string, 
    jobTitle: string, 
    workerName: string, 
    applicationMessage: string
  ): Promise<void> {
    const emailTemplate = {
      emailTo: recruiterEmail,
      subject: `New Application: ${jobTitle}`,
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6bff;">New Job Application Received!</h1>
          <p>Hello ${recruiterName},</p>
          <p>Great news! You have received a new application for your job posting.</p>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Application Details:</h3>
              <p><strong>Job Title:</strong> ${jobTitle}</p>
              <p><strong>Applicant:</strong> ${workerName}</p>
              ${applicationMessage ? `<p><strong>Message:</strong></p><div style="background-color: white; padding: 15px; border-radius: 5px; font-style: italic;">"${applicationMessage}"</div>` : ''}
          </div>
          
          
          <p style="color: #666; font-size: 14px;">
              Don't keep great candidates waiting - review and respond to applications promptly to secure the best talent!
          </p>
          
          <br/>
          <p>Happy hiring!<br/>
          <strong>The CareBridge Team</strong></p>
      </div>`,
    };

    await this.sendMail(emailTemplate);
  }

  async sendWorkAssignmentNotification(
    workerEmail?: string, 
    workerName?: string, 
    jobTitle?: string, 
    startTime?: Date, 
    endTime?: Date, 
    workDate?: Date, 
    recruiterName?: string
  ): Promise<void> {
    if (!workerEmail) {
      throw new Error('workerEmail is required to send work assignment notification.');
    }
    const emailTemplate = {
      emailTo: workerEmail,
      subject: `Work Assignment Confirmed: ${jobTitle}`,
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745;">Work Assignment Confirmed! 🎉</h1>
          <p>Hello ${workerName},</p>
          <p>Congratulations! You have been assigned to a new work opportunity.</p>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">Assignment Details:</h3>
              <p><strong>Job:</strong> ${jobTitle}</p>
              <p><strong>Recruiter:</strong> ${recruiterName}</p>
              <p><strong>Date:</strong> ${workDate ? new Date(workDate).toLocaleDateString() : 'N/A'}</p>
              ${startTime ? `<p><strong>Start Time:</strong> ${new Date(startTime).toLocaleTimeString()}</p>` : ''}
              ${endTime ? `<p><strong>End Time:</strong> ${new Date(endTime).toLocaleTimeString()}</p>` : ''}
          </div>
          
          <div style="background-color: #cce5ff; padding: 15px; border-radius: 8px;">
              <p style="margin: 0;"><strong>What's Next:</strong></p>
              <p style="margin: 5px 0;">• Review the job details and requirements<br/>
              • Contact the recruiter if you have questions<br/>
              • Be prepared and arrive on time<br/>
              • Complete the assignment successfully</p>
          </div>
          
          
          <p style="color: #666; font-size: 14px;">
              Good luck with your assignment! Remember to maintain professionalism and deliver quality work.
          </p>
          
          <br/>
          <p>Best of luck!<br/>
          <strong>The CareBridge Team</strong></p>
      </div>`,
    };

    await this.sendMail(emailTemplate);
  }
  async notifyAdminAboutRecruiterInterest(
    adminEmail: string,
    adminName: string,
    recruiter: Recruiter & { user: { firstName: string; lastName: string; email: string } },
    worker: Worker & { user: { firstName: string; lastName: string; email: string } },
    message?: string
  ): Promise<void> {
    const emailTemplate = {
      emailTo: adminEmail,
      subject: `New Connection Request: ${recruiter.user.firstName} ${recruiter.user.lastName} → ${worker.user.firstName} ${worker.user.lastName}`,
      message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4a6bff; margin-bottom: 5px;">New Connection Request</h1>
              <p style="color: #7f8c8d;">Hello ${adminName} Action required: Review this new connection request</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Request Details</h2>
              
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                  <div style="width: 48%; min-width: 250px; margin-bottom: 15px;">
                      <h3 style="color: #4a6bff; margin-bottom: 10px;">Recruiter Information</h3>
                      <p><strong>Name:</strong> ${recruiter.user.firstName} ${recruiter.user.lastName}</p>
                      <p><strong>Company:</strong> ${recruiter.companyName || 'Not specified'}</p>
                      <p><strong>Email:</strong> ${recruiter.user.email}</p>
                      <p><strong>Location:</strong> ${recruiter.location || 'Not specified'}</p>
                      ${recruiter.website ? `<p><strong>Website:</strong> <a href="${recruiter.website}" target="_blank">${recruiter.website}</a></p>` : ''}
                  </div>
                  
                  <div style="width: 48%; min-width: 250px;">
                      <h3 style="color: #4a6bff; margin-bottom: 10px;">Worker Information</h3>
                      <p><strong>Name:</strong> ${worker.user.firstName} ${worker.user.lastName}</p>
                      <p><strong>Email:</strong> ${worker.user.email}</p>
                      <p><strong>Location:</strong> ${worker?.location || 'Not specified'}</p>
                      <p><strong>Skills:</strong> ${worker.skills || 'Not specified'}</p>
                      <p><strong>Experience:</strong> ${worker.experience || 'Not specified'}</p>
                      ${worker.resume ? `<p><strong>Resume:</strong> <a href="${worker.resume}" target="_blank">View Resume</a></p>` : ''}
                  </div>
              </div>

              ${message ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #4a6bff;">
                  <h4 style="margin-top: 0; color: #333;">Recruiter's Message:</h4>
                  <p style="font-style: italic;">"${message}"</p>
              </div>
              ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.ADMIN_DASHBOARD_URL}/connections/pending" 
                 style="background-color:#4a6bff; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:600;">
                 Review Request
              </a>
          </div>

          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #7f8c8d; font-size: 14px;">
              <p>This is an automated notification. Please do not reply directly to this email.</p>
              <p>If you need assistance, contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@carebridge.com'}">${process.env.SUPPORT_EMAIL || 'support@carebridge.com'}</a></p>
          </div>

          <p style="margin-top: 30px; text-align: center; color: #95a5a6;">
              Best regards,<br>
              <strong>The CareBridge Team</strong>
          </p>
      </div>
      `,
    };

    await this.sendMail(emailTemplate);
  }
}
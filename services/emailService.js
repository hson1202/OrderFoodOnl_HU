import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// Create transporter (supports Gmail, Resend, and custom SMTP)
export const createTransporter = () => {
  const resendKey = process.env.RESEND_API_KEY
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS
  const host = process.env.EMAIL_HOST
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined
  const service = process.env.EMAIL_SERVICE || 'gmail'
  const secure = process.env.EMAIL_SECURE === 'true' || (port === 465)

  // Priority 1: Resend (recommended for production)
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      console.log('✅ Email configured via Resend')
      console.log(`   API Key: ${resendKey.substring(0, 10)}...`)
      console.log(`   From: ${user || 'noreply@yourdomain.com'}`)
      
      // Return Resend instance with nodemailer-like interface
      return {
        isResend: true,
        resend,
        sendMail: async (mailOptions) => {
          const result = await resend.emails.send({
            from: mailOptions.from || user || 'noreply@yourdomain.com',
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text
          })
          return { messageId: result.data?.id || result.id }
        }
      }
    } catch (error) {
      console.error('❌ Error creating Resend client:', error.message)
      return null
    }
  }

  // Priority 2: Gmail/SMTP (for development or if Resend not available)
  if (!user || !pass) {
    console.log('⚠️ Email configuration not found. Emails will not be sent.')
    console.log('⚠️ Required: RESEND_API_KEY (recommended) or EMAIL_USER + EMAIL_PASSWORD')
    console.log('📋 Current config:')
    console.log('   - RESEND_API_KEY:', resendKey ? '✓ Set' : '✗ Missing')
    console.log('   - EMAIL_USER:', user ? '✓ Set' : '✗ Missing')
    console.log('   - EMAIL_PASSWORD:', pass ? '✓ Set' : '✗ Missing')
    console.log('   - ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✓ Set' : '✗ Missing')
    return null
  }

  try {
    let transporter
    if (host) {
      transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure,
        auth: { user, pass }
      })
      console.log('✅ Email transporter configured via SMTP')
      console.log(`   Host: ${host}:${port || 587}`)
    } else {
      transporter = nodemailer.createTransport({
        service,
        auth: { user, pass }
      })
      console.log(`✅ Email transporter configured via ${service}`)
      console.log(`   From: ${user}`)
    }
    return transporter
  } catch (error) {
    console.error('❌ Error creating email transporter:', error.message)
    console.error('   Full error:', error)
    return null
  }
}

// Test email service connection
export const testEmailService = async () => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return {
        success: false,
        configured: false,
        message: 'Email service not configured. Please set RESEND_API_KEY or EMAIL_USER + EMAIL_PASSWORD in environment variables.'
      }
    }

    // Resend doesn't need verify (API key is verified on first send)
    if (transporter.isResend) {
      console.log('✅ Resend email service ready!')
      return {
        success: true,
        configured: true,
        provider: 'Resend',
        message: 'Resend email service is configured correctly',
        from: process.env.EMAIL_USER || 'noreply@yourdomain.com',
        adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@yourdomain.com'
      }
    }

    // Verify SMTP connection (for Gmail/custom SMTP)
    await transporter.verify()
    
    console.log('✅ Email service connection verified successfully!')
    return {
      success: true,
      configured: true,
      provider: process.env.EMAIL_SERVICE || 'SMTP',
      message: 'Email service is working correctly',
      from: process.env.EMAIL_USER,
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    }
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message)
    console.error('   Error details:', error)
    return {
      success: false,
      configured: true,
      message: `Email service configured but verification failed: ${error.message}`,
      error: error.message,
      errorCode: error.code
    }
  }
}

// Send test email
export const sendTestEmail = async (toEmail) => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return {
        success: false,
        message: 'Email service not configured'
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: '✅ VIET BOWLS - Email Service Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px;">
            <h1>✅ Email Service Working!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 8px;">
            <h2>🎉 Success!</h2>
            <p>This is a test email from <strong>VIET BOWLS Backend</strong>.</p>
            <p>If you're receiving this email, it means the email service is configured correctly and working.</p>
            
            <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #27ae60;">
              <h3>Email Configuration:</h3>
              <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
              <p><strong>To:</strong> ${toEmail}</p>
              <p><strong>Service:</strong> ${process.env.EMAIL_SERVICE || 'gmail'}</p>
              <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}</p>
            </div>
            
            <p><strong>What this means:</strong></p>
            <ul>
              <li>✅ Email credentials are valid</li>
              <li>✅ SMTP connection is working</li>
              <li>✅ Order confirmation emails will be sent</li>
              <li>✅ Admin notification emails will be sent</li>
            </ul>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <em>This is an automated test email from VIET BOWLS Backend.<br>
              Timestamp: ${new Date().toLocaleString()}</em>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
✅ VIET BOWLS - Email Service Test

Success! This is a test email from VIET BOWLS Backend.

If you're receiving this email, it means the email service is configured correctly and working.

Email Configuration:
- From: ${process.env.EMAIL_USER}
- To: ${toEmail}
- Service: ${process.env.EMAIL_SERVICE || 'gmail'}
- Admin Email: ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}

What this means:
✅ Email credentials are valid
✅ SMTP connection is working
✅ Order confirmation emails will be sent
✅ Admin notification emails will be sent

---
This is an automated test email from VIET BOWLS Backend.
Timestamp: ${new Date().toLocaleString()}
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully:', result.messageId)
    
    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      to: toEmail
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return {
      success: false,
      message: `Failed to send test email: ${error.message}`,
      error: error.message,
      errorCode: error.code
    }
  }
}

// Send reservation confirmation email
export const sendReservationConfirmation = async (reservation) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Reservation saved but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: 'Reservation Confirmation - VIET BOWLS',
      html: generateConfirmationEmailHTML(reservation),
      text: generateConfirmationEmailText(reservation)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send reservation status update email
export const sendStatusUpdateEmail = async (reservation, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Status updated but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: `Reservation Status Updated - VIET BOWLS`,
      html: generateStatusUpdateEmailHTML(reservation, oldStatus, newStatus),
      text: generateStatusUpdateEmailText(reservation, oldStatus, newStatus)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Status update email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending status update email:', error)
    return { success: false, error: error.message }
  }
}

// Send contact message confirmation email
export const sendContactConfirmation = async (contactMessage, adminResponse = null) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Contact message saved but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactMessage.email,
      subject: adminResponse ? 'Response to Your Message - VIET BOWLS' : 'Message Received - VIET BOWLS',
      html: generateContactConfirmationEmailHTML(contactMessage, adminResponse),
      text: generateContactConfirmationEmailText(contactMessage, adminResponse)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Contact confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending contact confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification for new contact message
export const sendAdminNotification = async (contactMessage) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Admin notification not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Message - ${contactMessage.subject.toUpperCase()} - VIET BOWLS`,
      html: generateAdminNotificationEmailHTML(contactMessage),
      text: generateAdminNotificationEmailText(contactMessage)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Admin notification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error)
    return { success: false, error: error.message }
  }
}

// Send order confirmation email
export const sendOrderConfirmation = async (order) => {
  try {
    // Kiểm tra xem có email không
    if (!order.customerInfo?.email) {
      console.log('⚠️ Order confirmation email not sent: No email address provided');
      return { 
        success: true, 
        messageId: 'no_email',
        message: 'Order confirmation not sent (no email address provided)'
      }
    }

    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Order confirmation not sent (email service not configured)'
      }
    }
    
    const lang = order.language || 'vi';
    const t = getEmailTranslations(lang);
    const subjectMap = {
      vi: `Cảm ơn bạn đã đặt hàng #${order.trackingCode} - VIET BOWLS`,
      en: `Thanks for your order #${order.trackingCode} - VIET BOWLS`,
      hu: `Köszönjük a rendelését #${order.trackingCode} - VIET BOWLS`
    };
    const langCode = lang?.split('-')[0] || 'vi';
    const subject = subjectMap[langCode] || subjectMap['vi'];
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerInfo.email,
      subject: subject,
      html: generateOrderConfirmationEmailHTML(order),
      text: generateOrderConfirmationEmailText(order)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Order confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification for new order
export const sendAdminOrderNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    
    // Kiểm tra xem có email admin không
    if (!adminEmail) {
      console.error('❌ Admin order notification not sent: ADMIN_EMAIL not configured');
      console.error('   Please set ADMIN_EMAIL in .env file');
      return { 
        success: false, 
        messageId: 'no_admin_email',
        message: 'Admin order notification not sent (ADMIN_EMAIL not configured)'
      }
    }
    
    console.log(`📧 Preparing to send admin order notification to: ${adminEmail}`);
    console.log(`   Order ID: ${order._id}, Tracking Code: ${order.trackingCode}`);
    
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.error('❌ Admin order notification not sent: Email service not configured');
      console.error('   Please set RESEND_API_KEY or EMAIL_USER + EMAIL_PASSWORD in .env file');
      return { 
        success: false, 
        messageId: 'email_not_configured',
        message: 'Admin order notification not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `Đơn hàng mới #${order.trackingCode} - ${order.customerInfo.name}`,
      html: generateAdminOrderNotificationEmailHTML(order),
      text: generateAdminOrderNotificationEmailText(order)
    }
    
    console.log(`📤 Sending admin order notification email to: ${adminEmail}`);
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Admin order notification email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${adminEmail}`);
    console.log(`   Order: #${order.trackingCode}`);
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending admin order notification email:', error)
    console.error('   Error details:', error.message)
    if (error.response) {
      console.error('   Error response:', error.response)
    }
    return { success: false, error: error.message }
  }
}

// Generate HTML email content for confirmation
const generateConfirmationEmailHTML = (reservation) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatTime = (time) => {
    return time
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reservation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Reservation Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${reservation.customerName}</strong>,</p>
          
          <p>Thank you for choosing VIET BOWLS! Your reservation has been received and is currently being reviewed.</p>
          
          <div class="reservation-details">
            <h3>📅 Reservation Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(reservation.reservationDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(reservation.reservationTime)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Guests:</span>
              <span class="value">${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            ${reservation.note ? `
            <div class="detail-row">
              <span class="label">Special Requests:</span>
              <span class="value">${reservation.note}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="contact-info">
            <h4>📍 Restaurant Information</h4>
            <p><strong>Address:</strong> 1051 Budapest, Hungary</p>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com</p>
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please arrive 5-10 minutes before your reservation time</li>
            <li>We will confirm your booking within 2 hours</li>
            <li>For any changes, please contact us at least 24 hours in advance</li>
            <li>Dress code: Smart casual</li>
          </ul>
          
          <p>We look forward to serving you!</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for confirmation
const generateConfirmationEmailText = (reservation) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return `
VIET BOWLS - Reservation Confirmation

Dear ${reservation.customerName},

Thank you for choosing VIET BOWLS! Your reservation has been received and is currently being reviewed.

RESERVATION DETAILS:
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Number of Guests: ${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}
${reservation.note ? `Special Requests: ${reservation.note}` : ''}

RESTAURANT INFORMATION:
Address: 1051 Budapest, Hungary
Email: vietbowlssala666@gmail.com

IMPORTANT NOTES:
- Please arrive 5-10 minutes before your reservation time
- We will confirm your booking within 2 hours
- For any changes, please contact us at least 24 hours in advance
- Dress code: Smart casual

We look forward to serving you!

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for status updates
const generateStatusUpdateEmailHTML = (reservation, oldStatus, newStatus) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reservation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Reservation Status Update</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${reservation.customerName}</strong>,</p>
          
          <p>Your reservation has been updated.</p>
          
          <div class="reservation-details">
            <h3>📅 Reservation Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(reservation.reservationDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${reservation.reservationTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Guests:</span>
              <span class="value">${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            ${reservation.adminNote ? `
            <div class="detail-row">
              <span class="label">Admin Note:</span>
              <span class="value">${reservation.adminNote}</span>
            </div>
            ` : ''}
          </div>
          
          ${newStatus === 'confirmed' ? `
          <p><strong>Your reservation is confirmed! 🎉</strong></p>
          <p>Please arrive 5-10 minutes before your reservation time. We look forward to serving you!</p>
          ` : newStatus === 'cancelled' ? `
          <p><strong>Your reservation has been cancelled.</strong></p>
          <p>If you have any questions, please contact us directly.</p>
          ` : newStatus === 'completed' ? `
          <p><strong>Thank you for dining with us!</strong></p>
          <p>We hope you enjoyed your meal. Please visit us again soon!</p>
          ` : ''}
          
          <p>If you have any questions, please contact us:</p>
          <p><strong>Email:</strong> vietbowlssala666@gmail.com<br>
          <strong>Address:</strong> 1051 Budapest, Hungary</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for status updates
const generateStatusUpdateEmailText = (reservation, oldStatus, newStatus) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }
  
  return `
VIET BOWLS - Reservation Status Update

Dear ${reservation.customerName},

Your reservation has been updated.

RESERVATION DETAILS:
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Number of Guests: ${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}
${reservation.adminNote ? `Admin Note: ${reservation.adminNote}` : ''}

${newStatus === 'confirmed' ? `
Your reservation is confirmed! 🎉

Please arrive 5-10 minutes before your reservation time. We look forward to serving you!
` : newStatus === 'cancelled' ? `
Your reservation has been cancelled.

If you have any questions, please contact us directly.
` : newStatus === 'completed' ? `
Thank you for dining with us!

We hope you enjoyed your meal. Please visit us again soon!
` : ''}

If you have any questions, please contact us:
Email: vietbowlssala666@gmail.com
Address: 1051 Budapest, Hungary

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for contact confirmation
const generateContactConfirmationEmailHTML = (contactMessage, adminResponse = null) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${adminResponse ? 'Response to Your Message' : 'Message Received'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .admin-response { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>${adminResponse ? 'Response to Your Message' : 'Message Received'}</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${contactMessage.name}</strong>,</p>
          
          ${adminResponse ? `
          <p>Thank you for contacting us. We have received your message and would like to provide you with a response:</p>
          
          <div class="admin-response">
            <h3>Our Response:</h3>
            <p>${adminResponse}</p>
          </div>
          
          <p>If you have any further questions or need additional assistance, please don't hesitate to contact us again.</p>
          ` : `
          <p>Thank you for contacting VIET BOWLS. We have received your message and will get back to you as soon as possible.</p>
          
          <p>Here are the details of your message:</p>
          `}
          
          <div class="message-details">
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Message:</span>
              <span class="value">${contactMessage.message}</span>
            </div>
            <div class="detail-row">
              <span class="label">Sent:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com<br>
            <strong>Address:</strong> 1051 Budapest, Hungary</p>
          </div>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for contact confirmation
const generateContactConfirmationEmailText = (contactMessage, adminResponse = null) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
VIET BOWLS - ${adminResponse ? 'Response to Your Message' : 'Message Received'}

Dear ${contactMessage.name},

${adminResponse ? `
Thank you for contacting us. We have received your message and would like to provide you with a response:

OUR RESPONSE:
${adminResponse}

If you have any further questions or need additional assistance, please don't hesitate to contact us again.
` : `
Thank you for contacting VIET BOWLS. We have received your message and will get back to you as soon as possible.

Here are the details of your message:
`}

MESSAGE DETAILS:
Subject: ${getSubjectText(contactMessage.subject)}
Message: ${contactMessage.message}
Sent: ${formatDate(contactMessage.createdAt)}

CONTACT INFORMATION:
Email: vietbowlssala666@gmail.com
Address: 1051 Budapest, Hungary

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for admin notification
const generateAdminNotificationEmailHTML = (contactMessage) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c'
      case 'high': return '#f39c12'
      case 'medium': return '#3498db'
      case 'low': return '#27ae60'
      default: return '#3498db'
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Message - ${contactMessage.subject.toUpperCase()}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
        .customer-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>New Contact Message - ${contactMessage.subject.toUpperCase()}</p>
        </div>
        
        <div class="content">
          <p>A new contact message has been received from the website.</p>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${contactMessage.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${contactMessage.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Priority:</span>
              <span class="value">
                <span class="priority-badge" style="background-color: ${getPriorityColor(contactMessage.priority)};">
                  ${contactMessage.priority.toUpperCase()}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Received:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="message-details">
            <h3>Message Content</h3>
            <p>${contactMessage.message}</p>
          </div>
          
          <p><strong>Action Required:</strong> Please review this message and respond appropriately.</p>
          
          <p>You can manage this message through the admin panel.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification email.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for admin notification
const generateAdminNotificationEmailText = (contactMessage) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
VIET BOWLS - New Contact Message

A new contact message has been received from the website.

CUSTOMER INFORMATION:
Name: ${contactMessage.name}
Email: ${contactMessage.email}
Subject: ${getSubjectText(contactMessage.subject)}
Priority: ${contactMessage.priority.toUpperCase()}
Received: ${formatDate(contactMessage.createdAt)}

MESSAGE CONTENT:
${contactMessage.message}

ACTION REQUIRED: Please review this message and respond appropriately.

You can manage this message through the admin panel.

---
This is an automated notification email.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Email translations for customer order confirmation
const getEmailTranslations = (lang) => {
  const langCode = lang?.split('-')[0] || 'vi'; // Extract base language code (vi, en, sk)
  
  const translations = {
    vi: {
      title: 'Xác nhận đơn hàng',
      greeting: 'Chào bạn',
      thankYou: 'Cảm ơn bạn đã đặt hàng tại VIET BOWLS! Chúng tôi đã nhận được đơn hàng và đang chuẩn bị món ăn tươi ngon cho bạn.',
      trackingCode: 'Mã theo dõi đơn hàng',
      orderDetails: 'Thông tin đơn hàng',
      orderDate: 'Ngày đặt',
      orderType: 'Loại đơn',
      orderTypeRegistered: 'Thành viên',
      orderTypeGuest: 'Khách vãng lai',
      fulfillmentType: 'Hình thức nhận',
      fulfillmentDelivery: 'Giao hàng',
      fulfillmentPickup: 'Lấy tại quán',
      fulfillmentDineIn: 'Dùng tại quán',
      paymentMethod: 'Thanh toán',
      paymentCOD: 'Tiền mặt khi nhận hàng',
      orderItems: 'Món đã đặt',
      subtotal: 'Tạm tính',
      deliveryFee: 'Phí giao hàng',
      total: 'Tổng cộng',
      deliveryAddress: 'Địa chỉ nhận hàng',
      phone: 'Số điện thoại',
      contactInfo: 'Liên hệ với chúng tôi',
      importantNotes: 'Một vài lưu ý nhỏ',
      note1: 'Bạn có thể theo dõi đơn hàng bằng mã',
      note2: 'Thanh toán bằng tiền mặt khi nhận hàng nhé',
      note3: 'Đơn hàng sẽ được giao trong vòng 30-60 phút',
      note4: 'Nếu có thắc mắc gì, đừng ngại liên hệ với chúng tôi nhé!',
      closing: 'Cảm ơn bạn đã tin tưởng VIET BOWLS. Chúc bạn ngon miệng! 🍜',
      regards: 'Thân mến,',
      team: 'Đội ngũ VIET BOWLS',
      footer1: 'Email này được gửi tự động. Nếu cần hỗ trợ, vui lòng liên hệ trực tiếp với chúng tôi.',
      footer2: '© 2024 VIET BOWLS'
    },
    en: {
      title: 'Order Confirmation',
      greeting: 'Hi there',
      thankYou: 'Thank you for ordering from VIET BOWLS! We\'ve received your order and our kitchen is already preparing your delicious meal.',
      trackingCode: 'Your Order Tracking Code',
      orderDetails: 'Order Information',
      orderDate: 'Order Date',
      orderType: 'Order Type',
      orderTypeRegistered: 'Member',
      orderTypeGuest: 'Guest',
      fulfillmentType: 'Fulfillment',
      fulfillmentDelivery: 'Delivery',
      fulfillmentPickup: 'Pickup',
      fulfillmentDineIn: 'Dine in',
      paymentMethod: 'Payment',
      paymentCOD: 'Cash on Delivery',
      orderItems: 'Your Order',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      total: 'Total',
      deliveryAddress: 'Delivery Address',
      phone: 'Phone',
      contactInfo: 'Get in Touch',
      importantNotes: 'A Few Quick Notes',
      note1: 'You can track your order using code',
      note2: 'Please have cash ready for payment upon delivery',
      note3: 'Your order will arrive within 30-60 minutes',
      note4: 'If you have any questions, feel free to reach out to us anytime!',
      closing: 'Thanks for choosing VIET BOWLS. Enjoy your meal! 🍜',
      regards: 'Warm regards,',
      team: 'The VIET BOWLS Team',
      footer1: 'This is an automated email. For support, please contact us directly.',
      footer2: '© 2024 VIET BOWLS'
    },
    hu: {
      title: 'Rendelés visszaigazolása',
      greeting: 'Helló',
      thankYou: 'Köszönjük, hogy a VIET BOWLS-nál rendelt! Megkaptuk rendelését, konyhánk már készíti finom ételeit.',
      trackingCode: 'Követési kódja',
      orderDetails: 'Rendelés adatai',
      orderDate: 'Rendelés dátuma',
      orderType: 'Rendelés típusa',
      orderTypeRegistered: 'Tag',
      orderTypeGuest: 'Vendég',
      fulfillmentType: 'Átvétel módja',
      fulfillmentDelivery: 'Kiszállítás',
      fulfillmentPickup: 'Átvétel helyben',
      fulfillmentDineIn: 'Helyben fogyasztás',
      paymentMethod: 'Fizetés',
      paymentCOD: 'Utánvét',
      orderItems: 'Rendelése',
      subtotal: 'Részösszeg',
      deliveryFee: 'Kiszállítási díj',
      total: 'Összesen',
      deliveryAddress: 'Szállítási cím',
      phone: 'Telefon',
      contactInfo: 'Kapcsolat',
      importantNotes: 'Néhány gyors megjegyzés',
      note1: 'Rendelését a kóddal követheti nyomon',
      note2: 'Kérjük, készítse elő a készpénzt a kiszállításkor',
      note3: 'Rendelése 30–60 percen belül megérkezik',
      note4: 'Kérdése van? Keressen minket bátran!',
      closing: 'Köszönjük, hogy a VIET BOWLS-t választotta. Jó étvágyat! 🍜',
      regards: 'Üdvözlettel,',
      team: 'A VIET BOWLS csapata',
      footer1: 'Ez egy automatikus e-mail. Támogatásért kérjük, közvetlenül írjon nekünk.',
      footer2: '© 2024 VIET BOWLS'
    }
  };
  
  return translations[langCode] || translations['vi']; // Default to Vietnamese
};

// Calculate item price including box fee and options (same logic as frontend)
const calculateItemPrice = (item) => {
  // Tính giá gốc (chưa bao gồm box fee)
  let basePrice = 0;
  
  // Nếu có options và selectedOptions
  if (item.options && item.options.length > 0 && item.selectedOptions) {
    basePrice = item.price || 0;
    
    Object.entries(item.selectedOptions).forEach(([optionName, choiceCode]) => {
      const option = item.options.find(opt => opt.name === optionName);
      if (option) {
        const choice = option.choices.find(c => c.code === choiceCode);
        if (choice) {
          if (option.pricingMode === 'override') {
            basePrice = choice.price;
          } else if (option.pricingMode === 'add') {
            basePrice += choice.price;
          }
        }
      }
    });
  } else {
    // Nếu không có options, dùng promotion price hoặc regular price
    basePrice = item.isPromotion && item.promotionPrice ? item.promotionPrice : (item.price || 0);
  }
  
  // Kiểm tra giá có hợp lệ không
  if (isNaN(Number(basePrice)) || Number(basePrice) < 0) {
    basePrice = 0;
  }
  
  // Thêm tiền hộp 30 Ft nếu không tắt
  const isBoxFeeDisabled = item.disableBoxFee === true || 
                         item.disableBoxFee === "true" || 
                         item.disableBoxFee === 1 || 
                         item.disableBoxFee === "1" ||
                         (typeof item.disableBoxFee === 'string' && item.disableBoxFee.toLowerCase() === 'true');
  const boxFee = isBoxFeeDisabled ? 0 : 0.3;
  const finalPrice = Number(basePrice) + boxFee;
  
  return finalPrice;
};

// Generate HTML email content for order confirmation
const generateOrderConfirmationEmailHTML = (order) => {
  const lang = order.language || 'vi';
  const t = getEmailTranslations(lang);
  
  const formatDate = (date) => {
    const localeMap = { vi: 'vi-VN', en: 'en-US', hu: 'hu-HU' };
    const locale = localeMap[lang?.split('-')[0]] || 'vi-VN';
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (isNaN(n) || n < 0) return '0 Ft';
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(n));
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  const fulfillmentLabel = order.fulfillmentType === 'pickup'
    ? 'Lấy tại quán'
    : order.fulfillmentType === 'dinein'
      ? 'Dùng tại quán'
      : 'Giao hàng';
  const hasAddress = !!(order.address && (order.address.street || order.address.address || order.address.fullAddress));
  const addressLine = order.address ? order.address.street || order.address.address || '' : '';
  const addressCity = order.address?.city || '';
  const addressState = order.address?.state || '';
  const addressZip = order.address?.zipcode || '';
  const addressCountry = order.address?.country || '';
  const fulfillmentLabel = order.fulfillmentType === 'pickup'
    ? t.fulfillmentPickup
    : order.fulfillmentType === 'dinein'
      ? t.fulfillmentDineIn
      : t.fulfillmentDelivery;
  const hasAddress = !!(order.address && (order.address.street || order.address.address || order.address.fullAddress));
  const addressLine = order.address ? order.address.street || order.address.address || '' : '';
  const addressCity = order.address?.city || '';
  const addressState = order.address?.state || '';
  const addressZip = order.address?.zipcode || '';
  const addressCountry = order.address?.country || '';
  const fulfillmentLabel = order.fulfillmentType === 'pickup'
    ? t.fulfillmentPickup
    : order.fulfillmentType === 'dinein'
      ? t.fulfillmentDineIn
      : t.fulfillmentDelivery;
  const hasAddress = !!(order.address && (order.address.street || order.address.address || order.address.fullAddress));
  const addressLine = order.address ? order.address.street || order.address.address || '' : '';
  const addressCity = order.address?.city || '';
  const addressState = order.address?.state || '';
  const addressZip = order.address?.zipcode || '';
  const addressCountry = order.address?.country || '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title} - VIET BOWLS</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .tracking-code { background: #e74c3c; color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .items-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .item-name { font-weight: bold; }
        .item-quantity { color: #666; }
        .item-price { color: #333; }
        .total-section { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; }
        .total-final { font-size: 20px; font-weight: bold; color: #e74c3c; }
        .address-section { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>${t.title}</h2>
        </div>
        
        <div class="content">
          <p>${t.greeting} <strong>${order.customerInfo.name}</strong>,</p>
          
          <p>${t.thankYou}</p>
          
          <div class="tracking-code">
            ${t.trackingCode}: ${order.trackingCode}
          </div>
          
          <div class="order-details">
            <h3>📦 ${t.orderDetails}</h3>
            <div class="detail-row">
              <span class="label">${t.orderDate}:</span>
              <span class="value">${formatDate(order.createdAt || order.date)}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.orderType}:</span>
              <span class="value">${order.orderType === 'registered' ? t.orderTypeRegistered : t.orderTypeGuest}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.fulfillmentType}:</span>
              <span class="value">${fulfillmentLabel}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.paymentMethod}:</span>
              <span class="value">${t.paymentCOD}</span>
            </div>
          </div>
          
          <div class="items-list">
            ${order.items.map(item => `
              <div class="item-row">
                <div>
                  <span class="item-name">${item.name}</span>
                  <span class="item-quantity"> x ${item.quantity || 1}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>${t.subtotal}:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
              <span>${t.deliveryFee}:</span>
              <span>${formatCurrency(deliveryFee)}</span>
            </div>
            <div class="total-row total-final">
              <span>${t.total}:</span>
              <span>${formatCurrency(order.amount)}</span>
            </div>
          </div>
          
          ${hasAddress ? `
          <div class="address-section">
            <h3>📍 ${t.deliveryAddress}</h3>
            <p>
              <strong>${addressLine}</strong><br>
              ${[addressCity, addressState].filter(Boolean).join(', ')}<br>
              ${[addressZip, addressCountry].filter(Boolean).join(', ')}
            </p>
            <p><strong>${t.phone}:</strong> ${order.customerInfo.phone}</p>
          </div>
          ` : `
          <div class="address-section">
            <h3>📍 ${t.deliveryAddress}</h3>
            <p>${fulfillmentLabel}</p>
            <p><strong>${t.phone}:</strong> ${order.customerInfo.phone}</p>
          </div>
          `}
          
          <div class="contact-info">
            <h4>📞 ${t.contactInfo}</h4>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com</p>
            <p><strong>${t.deliveryAddress}:</strong> 1051 Budapest, Hungary</p>
          </div>
          
          <p><strong>${t.importantNotes}:</strong></p>
          <ul>
            <li>${t.note1}: <strong>${order.trackingCode}</strong></li>
            <li>${t.note2}</li>
            <li>${t.note3}</li>
            <li>${t.note4}</li>
          </ul>
          
          <p>${t.closing}</p>
          
          <p>${t.regards}<br>
          <strong>${t.team}</strong></p>
        </div>
        
        <div class="footer">
          <p>${t.footer1}</p>
          <p>${t.footer2}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for order confirmation
const generateOrderConfirmationEmailText = (order) => {
  const lang = order.language || 'vi';
  const t = getEmailTranslations(lang);
  
  const formatDate = (date) => {
    const localeMap = { vi: 'vi-VN', en: 'en-US', hu: 'hu-HU' };
    const locale = localeMap[lang?.split('-')[0]] || 'vi-VN';
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    const currencyMap = { vi: 'VND', en: 'HUF', hu: 'HUF' };
    const currency = currencyMap[lang?.split('-')[0]] || 'HUF';
    const localeMap = { vi: 'vi-VN', en: 'hu-HU', hu: 'hu-HU' };
    const locale = localeMap[lang?.split('-')[0]] || 'hu-HU';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(Number(amount)))
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  
  return `
VIET BOWLS - ${t.title}

${t.greeting} ${order.customerInfo.name},

${t.thankYou}

${t.trackingCode.toUpperCase()}: ${order.trackingCode}

${t.orderDetails.toUpperCase()}:
${t.orderDate}: ${formatDate(order.createdAt || order.date)}
${t.orderType}: ${order.orderType === 'registered' ? t.orderTypeRegistered : t.orderTypeGuest}
${t.fulfillmentType}: ${fulfillmentLabel}
${t.paymentMethod}: ${t.paymentCOD}

${t.orderItems.toUpperCase()}:
${order.items.map(item => `- ${item.name} x ${item.quantity || 1}`).join('\n')}

${t.orderDetails.toUpperCase()}:
${t.subtotal}: ${formatCurrency(subtotal)}
${t.deliveryFee}: ${formatCurrency(deliveryFee)}
${t.total}: ${formatCurrency(order.amount)}

${t.deliveryAddress.toUpperCase()}:
${hasAddress ? `${addressLine}
${[addressCity, addressState].filter(Boolean).join(', ')}
${[addressZip, addressCountry].filter(Boolean).join(', ')}` : fulfillmentLabel}
${t.phone}: ${order.customerInfo.phone}

${t.contactInfo.toUpperCase()}:
Email: vietbowlssala666@gmail.com
${t.deliveryAddress}: 1051 Budapest, Hungary

${t.importantNotes.toUpperCase()}:
- ${t.note1}: ${order.trackingCode}
- ${t.note2}
- ${t.note3}
- ${t.note4}

${t.closing}

${t.regards}
${t.team}

---
${t.footer1}
${t.footer2}
  `
}

// Generate HTML email content for admin order notification
const generateAdminOrderNotificationEmailHTML = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Đơn hàng mới #${order.trackingCode}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #2c3e50; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; }
        .header { background: #2c3e50; color: white; padding: 16px 20px; border-bottom: 3px solid #e74c3c; }
        .header h1 { margin: 0; font-size: 18px; font-weight: 600; }
        .content { padding: 20px; }
        .order-id { font-size: 20px; font-weight: 600; color: #e74c3c; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #ecf0f1; }
        .section { margin: 16px 0; }
        .section-title { font-size: 14px; font-weight: 600; color: #7f8c8d; text-transform: uppercase; margin-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 100px 1fr; gap: 8px 12px; font-size: 14px; }
        .info-label { color: #7f8c8d; }
        .info-value { color: #2c3e50; font-weight: 500; }
        .items-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
        .items-table td { padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
        .item-name { color: #2c3e50; }
        .item-qty { color: #7f8c8d; margin-left: 8px; }
        .item-price { text-align: right; color: #2c3e50; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .total-row.final { border-top: 2px solid #2c3e50; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 600; color: #e74c3c; }
        .address-box { background: #f8f9fa; padding: 12px; border-left: 3px solid #3498db; margin: 12px 0; font-size: 14px; line-height: 1.6; }
        .footer { text-align: center; padding: 16px; font-size: 12px; color: #95a5a6; border-top: 1px solid #ecf0f1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Đơn hàng mới - VIET BOWLS</h1>
        </div>
        
        <div class="content">
          <div class="order-id">Đơn hàng #${order.trackingCode}</div>
          
          <div class="section">
            <div class="section-title">Thông tin khách hàng</div>
            <div class="info-grid">
              <div class="info-label">Tên:</div>
              <div class="info-value">${order.customerInfo.name}</div>
              <div class="info-label">SĐT:</div>
              <div class="info-value">${order.customerInfo.phone}</div>
              ${order.customerInfo.email ? `
              <div class="info-label">Email:</div>
              <div class="info-value">${order.customerInfo.email}</div>
              ` : ''}
              <div class="info-label">Loại:</div>
              <div class="info-value">${order.orderType === 'registered' ? 'Thành viên' : 'Khách vãng lai'}</div>
              <div class="info-label">Hình thức:</div>
              <div class="info-value">${fulfillmentLabel}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Món ăn</div>
            <table class="items-table">
              ${order.items.map(item => `
                <tr>
                  <td class="item-name">${item.name}<span class="item-qty">x${item.quantity}</span></td>
                  <td class="item-price">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </table>
            <div class="total-row">
              <span>Tạm tính:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Phí giao hàng:</span>
              <span>${formatCurrency(deliveryFee)}</span>
            </div>
            <div class="total-row final">
              <span>Tổng cộng:</span>
              <span>${formatCurrency(order.amount)}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Địa chỉ giao hàng</div>
            <div class="address-box">
              ${hasAddress
                ? `${addressLine}<br>
              ${[addressCity, addressState].filter(Boolean).join(', ')}<br>
              ${[addressZip, addressCountry].filter(Boolean).join(', ')}`
                : fulfillmentLabel}
            </div>
          </div>
          
          <div class="section">
            <div class="info-grid">
              <div class="info-label">Thời gian:</div>
              <div class="info-value">${formatDate(order.createdAt || order.date)}</div>
              <div class="info-label">Thanh toán:</div>
              <div class="info-value">COD (Tiền mặt khi nhận)</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Email tự động từ hệ thống VIET BOWLS</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for admin order notification
const generateAdminOrderNotificationEmailText = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  const fulfillmentLabel = order.fulfillmentType === 'pickup'
    ? 'Lấy tại quán'
    : order.fulfillmentType === 'dinein'
      ? 'Dùng tại quán'
      : 'Giao hàng';
  const hasAddress = !!(order.address && (order.address.street || order.address.address || order.address.fullAddress));
  const addressLine = order.address ? order.address.street || order.address.address || '' : '';
  const addressCity = order.address?.city || '';
  const addressState = order.address?.state || '';
  const addressZip = order.address?.zipcode || '';
  const addressCountry = order.address?.country || '';
  
  return `
ĐƠN HÀNG MỚI - VIET BOWLS

Đơn hàng #${order.trackingCode}

THÔNG TIN KHÁCH HÀNG:
Tên: ${order.customerInfo.name}
SĐT: ${order.customerInfo.phone}
${order.customerInfo.email ? `Email: ${order.customerInfo.email}` : ''}
Loại: ${order.orderType === 'registered' ? 'Thành viên' : 'Khách vãng lai'}
Hình thức: ${fulfillmentLabel}

MÓN ĂN:
${order.items.map(item => `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n')}

TỔNG CỘNG:
Tạm tính: ${formatCurrency(subtotal)}
Phí giao hàng: ${formatCurrency(deliveryFee)}
Tổng: ${formatCurrency(order.amount)}

ĐỊA CHỈ GIAO HÀNG:
${hasAddress ? `${addressLine}
${[addressCity, addressState].filter(Boolean).join(', ')}
${[addressZip, addressCountry].filter(Boolean).join(', ')}` : fulfillmentLabel}

Thời gian: ${formatDate(order.createdAt || order.date)}
Thanh toán: COD (Tiền mặt khi nhận)

---
Email tự động từ hệ thống VIET BOWLS
  `
}

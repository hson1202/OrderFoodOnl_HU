import dotenv from 'dotenv'
import { Resend } from 'resend'
import { createTransporter, sendOrderConfirmation } from './services/emailService.js'

dotenv.config()

console.log('\n🔍 DEBUG PRODUCTION EMAIL - FULL CHECK\n')
console.log('=' .repeat(80))

// Step 1: Check Environment Variables
console.log('\n📋 STEP 1: Check Environment Variables\n')

const resendKey = process.env.RESEND_API_KEY
const emailUser = process.env.EMAIL_USER
const adminEmail = process.env.ADMIN_EMAIL

console.log('Environment Variables:')
console.log(`   RESEND_API_KEY: ${resendKey ? '✅ Set (' + resendKey.substring(0, 15) + '...)' : '❌ Missing'}`)
console.log(`   EMAIL_USER: ${emailUser ? '✅ ' + emailUser : '❌ Missing'}`)
console.log(`   ADMIN_EMAIL: ${adminEmail ? '✅ ' + adminEmail : '❌ Missing'}`)

if (!resendKey) {
  console.error('\n❌ RESEND_API_KEY không tồn tại! Cần set trong .env')
  process.exit(1)
}

if (!emailUser) {
  console.error('\n❌ EMAIL_USER không tồn tại! Cần set trong .env')
  process.exit(1)
}

// Step 2: Check Domain
console.log('\n' + '=' .repeat(80))
console.log('\n📧 STEP 2: Check Email Domain\n')

const domain = emailUser.split('@')[1]
console.log(`Email Domain: ${domain}`)

if (domain === 'resend.dev') {
  console.log('⚠️  Đang dùng resend.dev domain (testing only)')
  console.log('   → CHỈ gửi được đến owner email')
  console.log('   → Cần verify custom domain để gửi đến khách')
} else if (domain === 'gmail.com' || domain.includes('gmail')) {
  console.log('❌ Gmail domain - KHÔNG THỂ dùng với Resend!')
  console.log('   → Phải verify domain riêng hoặc dùng Gmail SMTP')
} else {
  console.log(`✅ Custom domain: ${domain}`)
  console.log('   → Kiểm tra xem đã verify trên Resend chưa...')
}

// Step 3: Test Resend API
console.log('\n' + '=' .repeat(80))
console.log('\n🔧 STEP 3: Test Resend API\n')

try {
  const resend = new Resend(resendKey)
  console.log('✅ Resend client initialized')
  
  // Test với customer email
  const testCustomerEmail = process.argv[2] || 'customer@example.com'
  
  console.log(`\n📤 Attempting to send test email...`)
  console.log(`   FROM: ${emailUser}`)
  console.log(`   TO: ${testCustomerEmail}`)
  console.log('   ⏳ Sending...\n')
  
  const result = await resend.emails.send({
    from: emailUser,
    to: testCustomerEmail,
    subject: '🧪 Test Email to Customer - VIET BOWLS',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 8px;">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Test Email to Customer</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px;">
          <h2 style="color: #27ae60;">✅ Domain Verified Successfully!</h2>
          <p>Nếu bạn nhận được email này, có nghĩa là:</p>
          <ul>
            <li>✅ Domain đã được verify đúng</li>
            <li>✅ Resend đang hoạt động</li>
            <li>✅ Gửi email đến customer thành công</li>
            <li>✅ Production ready!</li>
          </ul>
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <p><strong>From:</strong> ${emailUser}</p>
            <p><strong>To:</strong> ${testCustomerEmail}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="margin-top: 30px; color: #666;"><em>Test email from VIET BOWLS Backend</em></p>
        </div>
      </body>
      </html>
    `,
    text: `VIET BOWLS - Test Email\n\nDomain verified successfully!\nFrom: ${emailUser}\nTo: ${testCustomerEmail}`
  })
  
  console.log('📊 Resend API Response:')
  console.log(JSON.stringify(result, null, 2))
  console.log('\n' + '=' .repeat(80))
  
  if (result.error) {
    console.error('\n❌ LỖI KHI GỬI EMAIL:\n')
    console.error('Error:', result.error)
    console.error('Message:', result.error.message)
    
    console.log('\n💡 TROUBLESHOOTING:')
    
    if (result.error.message?.includes('domain') || result.error.message?.includes('verify')) {
      console.log('\n❌ DOMAIN CHƯA ĐƯỢC VERIFY HOÀN TẤT')
      console.log('\nCách kiểm tra:')
      console.log('1. Login Resend Dashboard: https://resend.com/domains')
      console.log('2. Tìm domain:', domain)
      console.log('3. Status phải là: ✅ Verified')
      console.log('4. Nếu chưa verified:')
      console.log('   - Check DNS records đã add chưa')
      console.log('   - Đợi thêm (DNS có thể mất 24-48h)')
      console.log('   - Verify DNS: https://dnschecker.org')
    }
    
    if (result.error.message?.includes('owner') || result.error.message?.includes('testing')) {
      console.log('\n❌ VẪN ĐANG DÙNG TESTING EMAIL')
      console.log('\nEmail FROM hiện tại:', emailUser)
      console.log('→ Cần đổi sang domain đã verify')
      console.log(`→ VD: orders@${domain}`)
      console.log('\nUpdate trong Backend/.env:')
      console.log(`   EMAIL_USER=orders@${domain}`)
    }
    
    if (result.error.message?.includes('quota')) {
      console.log('\n❌ VƯỢT QUOTA')
      console.log('Check usage: https://resend.com/dashboard')
      console.log('Free tier: 3,000 emails/month (100/day)')
    }
    
  } else if (result.data?.id || result.id) {
    const emailId = result.data?.id || result.id
    console.log('\n✅ EMAIL GỬI THÀNH CÔNG!\n')
    console.log(`   Email ID: ${emailId}`)
    console.log(`   From: ${emailUser}`)
    console.log(`   To: ${testCustomerEmail}`)
    console.log('\n📬 CHECK INBOX:')
    console.log(`   1. Check inbox: ${testCustomerEmail}`)
    console.log('   2. Check spam folder')
    console.log('   3. Đợi 1-2 phút')
    console.log('\n📊 RESEND DASHBOARD:')
    console.log(`   https://resend.com/emails/${emailId}`)
    console.log('   → Xem delivery status')
    
    console.log('\n✅ DOMAIN ĐÃ VERIFY THÀNH CÔNG!')
    console.log('   → Giờ có thể gửi đến mọi customer email')
    console.log('   → Production ready!')
  }
  
} catch (error) {
  console.error('\n❌ EXCEPTION:')
  console.error('Type:', error.constructor.name)
  console.error('Message:', error.message)
  console.error('Stack:', error.stack)
}

// Step 4: Test Order Email Flow
console.log('\n' + '=' .repeat(80))
console.log('\n📦 STEP 4: Test Order Email Flow\n')

console.log('Testing email service với order flow...\n')

try {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.error('❌ Transporter không được tạo!')
    console.error('   Check email service configuration')
  } else {
    console.log('✅ Transporter created:', transporter.isResend ? 'Resend' : 'SMTP')
    
    // Create mock order
    const mockOrder = {
      trackingCode: 'TEST-' + Date.now(),
      customerInfo: {
        name: 'Test Customer',
        email: process.argv[2] || 'customer@example.com',
        phone: '+421123456789'
      },
      items: [
        { name: 'Phở Bò', quantity: 2, price: 8.5 },
        { name: 'Bánh Mì', quantity: 1, price: 4.0 }
      ],
      amount: 23.0,
      address: {
        street: 'Hlavná 33/36',
        city: 'Budapest',
        state: 'Hungary',
        zipcode: '927 01',
        country: 'Hungary'
      },
      createdAt: new Date()
    }
    
    console.log('\n📤 Sending order confirmation email...')
    console.log(`   Order: ${mockOrder.trackingCode}`)
    console.log(`   Customer: ${mockOrder.customerInfo.email}`)
    console.log('   ⏳ Sending...\n')
    
    const orderEmailResult = await sendOrderConfirmation(mockOrder)
    
    console.log('📊 Order Email Result:')
    console.log(JSON.stringify(orderEmailResult, null, 2))
    
    if (orderEmailResult.success) {
      console.log('\n✅ ORDER CONFIRMATION EMAIL GỬI THÀNH CÔNG!')
      console.log(`   Message ID: ${orderEmailResult.messageId}`)
      console.log(`   To: ${mockOrder.customerInfo.email}`)
      console.log('\n📬 Customer sẽ nhận được email với:')
      console.log('   - Order tracking code')
      console.log('   - Order items & prices')
      console.log('   - Delivery address')
      console.log('   - Contact information')
      console.log('   - Beautiful HTML template')
    } else {
      console.error('\n❌ ORDER EMAIL THẤT BẠI!')
      console.error('   Message:', orderEmailResult.message)
      console.error('   Error:', orderEmailResult.error)
    }
  }
  
} catch (error) {
  console.error('\n❌ ERROR in order flow:')
  console.error('Message:', error.message)
}

// Step 5: Final Report
console.log('\n' + '=' .repeat(80))
console.log('\n📊 FINAL REPORT\n')

console.log('Configuration:')
console.log(`   Provider: Resend`)
console.log(`   API Key: ${resendKey ? '✅ Set' : '❌ Missing'}`)
console.log(`   From Email: ${emailUser}`)
console.log(`   Domain: ${domain}`)
console.log(`   Admin Email: ${adminEmail}`)

console.log('\n💡 NEXT STEPS:\n')

console.log('Nếu email GỬI THÀNH CÔNG:')
console.log('   ✅ Domain đã verify đúng')
console.log('   ✅ Server đã config đúng')
console.log('   ✅ Production ready!')
console.log('   → Place real order và check customer inbox')

console.log('\nNếu email THẤT BẠI:')
console.log('   1. Check Resend Dashboard: https://resend.com/domains')
console.log(`   2. Verify domain "${domain}" status = ✅ Verified`)
console.log('   3. Check DNS records (SPF, DKIM, DMARC)')
console.log('   4. Wait 24-48h nếu vừa add DNS')
console.log('   5. Try with different customer email')

console.log('\nCheck Server Logs:')
console.log('   → Khi place order, xem logs có:')
console.log('      ✅ Order confirmation email sent successfully')
console.log('      ✅ Admin order notification email sent successfully')

console.log('\n📝 Usage:')
console.log('   node debug-production-email.js')
console.log('   node debug-production-email.js customer@email.com')

console.log('\n' + '=' .repeat(80) + '\n')


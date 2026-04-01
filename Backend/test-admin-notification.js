import dotenv from 'dotenv'
import { sendAdminOrderNotification } from './services/emailService.js'

dotenv.config()

console.log('\n🧪 TEST ADMIN ORDER NOTIFICATION EMAIL\n')
console.log('='.repeat(80))

console.log('\n📋 Configuration Check:\n')
console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ Missing')
console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Missing')

if (!process.env.RESEND_API_KEY) {
    console.error('\n❌ RESEND_API_KEY không được set!')
    process.exit(1)
}

if (!process.env.ADMIN_EMAIL) {
    console.error('\n❌ ADMIN_EMAIL không được set!')
    console.error('   → Thêm vào .env: ADMIN_EMAIL=your-admin-email@example.com')
    process.exit(1)
}

console.log('\n' + '='.repeat(80))
console.log('\n📦 Creating Mock Order...\n')

// Create mock order với đầy đủ thông tin
const mockOrder = {
    _id: 'test-order-' + Date.now(),
    trackingCode: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase(),
    customerInfo: {
        name: 'Nguyễn Văn Test',
        email: 'customer-test@example.com',
        phone: '+421 123 456 789'
    },
    items: [
        {
            _id: 'item1',
            name: 'Phở Bò',
            quantity: 2,
            price: 8.5,
            selectedOptions: {}
        },
        {
            _id: 'item2',
            name: 'Bánh Mì Thịt',
            quantity: 1,
            price: 4.0,
            selectedOptions: {}
        },
        {
            _id: 'item3',
            name: 'Cà phê sữa đá',
            quantity: 1,
            price: 3.5,
            selectedOptions: {}
        }
    ],
    amount: 24.5,
    address: {
        street: 'Bajcsy-Zsilinszky út',
        houseNumber: '12',
        city: 'Budapest',
        state: 'Pest',
        zipcode: '1051',
        country: 'Hungary',
        coordinates: {
            lat: 47.4979,
            lng: 19.0402
        }
    },
    deliveryInfo: {
        zoneName: 'Budapest - Center',
        deliveryFee: 2.0,
        distance: 1.5,
        estimatedTime: 30
    },
    fulfillmentType: 'delivery',
    status: 'Pending',
    payment: true,
    note: 'Gọi chuông 2 lần. Để trước cửa nếu không có người.',
    preferredDeliveryTime: '18:00 - 18:30',
    createdAt: new Date(),
    language: 'vi'
}

console.log('Mock Order Details:')
console.log(`   Order ID: ${mockOrder._id}`)
console.log(`   Tracking Code: ${mockOrder.trackingCode}`)
console.log(`   Customer: ${mockOrder.customerInfo.name}`)
console.log(`   Phone: ${mockOrder.customerInfo.phone}`)
console.log(`   Total Amount: €${mockOrder.amount}`)
console.log(`   Items Count: ${mockOrder.items.length}`)
console.log(`   Delivery Address: ${mockOrder.address.street}, ${mockOrder.address.city}`)

console.log('\n' + '='.repeat(80))
console.log('\n📧 Sending Admin Notification Email...\n')

console.log(`   FROM: ${process.env.EMAIL_USER}`)
console.log(`   TO: ${process.env.ADMIN_EMAIL}`)
console.log(`   SUBJECT: Đơn hàng mới #${mockOrder.trackingCode} - ${mockOrder.customerInfo.name}`)
console.log('\n   ⏳ Sending...\n')

try {
    const result = await sendAdminOrderNotification(mockOrder)

    console.log('📊 Result:')
    console.log(JSON.stringify(result, null, 2))

    console.log('\n' + '='.repeat(80))

    if (result.success) {
        console.log('\n✅ ADMIN EMAIL GỬI THÀNH CÔNG!\n')
        console.log(`   Message ID: ${result.messageId}`)
        console.log(`   Admin Email: ${process.env.ADMIN_EMAIL}`)
        console.log('\n📬 CHECK ADMIN INBOX:')
        console.log(`   1. Open ${process.env.ADMIN_EMAIL}`)
        console.log('   2. Kiểm tra inbox (có thể trong spam folder)')
        console.log('   3. Đợi 1-2 phút để email đến')
        console.log('\n📊 RESEND DASHBOARD:')
        console.log('   https://resend.com/emails')
        console.log('   → Xem delivery status của email vừa gửi')
        console.log('\n✅ TEST THÀNH CÔNG!')
        console.log('   → Admin email service hoạt động bình thường')
        console.log('   → Khi có đơn hàng thật, admin sẽ nhận được email tương tự')
    } else {
        console.error('\n❌ ADMIN EMAIL THẤT BẠI!\n')
        console.error('   Message:', result.message || 'Unknown error')
        console.error('   Error:', result.error || 'N/A')

        console.log('\n💡 TROUBLESHOOTING:\n')

        if (result.message?.includes('not configured')) {
            console.log('❌ Email service chưa được cấu hình đúng')
            console.log('\nCheck .env file:')
            console.log('   1. RESEND_API_KEY=re_xxxxxx')
            console.log('   2. EMAIL_USER=orders@your-domain.com')
            console.log('   3. ADMIN_EMAIL=your-admin@email.com')
        }

        if (result.message?.includes('domain')) {
            console.log('❌ Domain chưa được verify trên Resend')
            console.log('\nSteps:')
            console.log('   1. Login: https://resend.com/domains')
            console.log('   2. Verify domain status')
            console.log('   3. Update EMAIL_USER với verified domain')
        }

        if (!result.messageId || result.messageId === 'email_not_configured') {
            console.log('❌ Transporter không được tạo thành công')
            console.log('   → Kiểm tra lại RESEND_API_KEY')
            console.log('   → Restart server sau khi update .env')
        }
    }

} catch (error) {
    console.error('\n❌ EXCEPTION:\n')
    console.error('   Type:', error.constructor.name)
    console.error('   Message:', error.message)
    console.error('   Stack:', error.stack)

    console.log('\n💡 COMMON ISSUES:\n')
    console.log('1. Network error: Check internet connection')
    console.log('2. Invalid API key: Verify RESEND_API_KEY')
    console.log('3. Domain not verified: Check Resend dashboard')
    console.log('4. Rate limit: Check Resend usage quota')
}

console.log('\n' + '='.repeat(80))
console.log('\n📝 Summary:\n')
console.log('This script tests the admin order notification email system.')
console.log('Nếu test thành công → Admin sẽ nhận được email khi có đơn hàng thật.')
console.log('Nếu test thất bại → Fix email configuration trước khi nhận đơn.')
console.log('\n' + '='.repeat(80) + '\n')

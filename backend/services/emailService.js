const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
// For Development: Use Ethereal Email (fake SMTP service)
// For Production: Use environment variables
let transporter = null;

const createTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.NODE_ENV === 'production') {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log('Email Service: Using Ethereal (Dev) - Messages will be logged with preview URL');
        } catch (err) {
            console.error('Failed to create Ethereal account', err);
        }
    }
    return transporter;
};

// Initialize transporter
createTransporter();

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailTransport = await createTransporter();
        if (!mailTransport) {
            console.error('Email Transporter not initialized');
            return;
        }

        const info = await mailTransport.sendMail({
            from: '"Document Tracking System" <system@example.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (err) {
        console.error('Error sending email:', err.message);
        // Don't throw, just log. Email failure shouldn't crash the app logic.
    }
};

const sendAssignmentNotification = async (userEmail, documentTitle, assignerName, docId) => {
    const subject = `[Assigned] You have been assigned: ${documentTitle}`;
    const html = `
        <h3>Document Assignment</h3>
        <p>You have been assigned to the document: <strong>${documentTitle}</strong></p>
        <p>Assigned by: ${assignerName}</p>
        <p><a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/document/${docId}">View Document</a></p>
    `;
    return sendEmail({ to: userEmail, subject, text: `You have been assigned to ${documentTitle}`, html });
};

const sendStatusChangeNotification = async (userEmail, documentTitle, newStatus, docId) => {
    const subject = `[Update] Document Status Changed: ${documentTitle}`;
    const html = `
        <h3>Status Update</h3>
        <p>The document <strong>${documentTitle}</strong> is now marked as: <strong>${newStatus}</strong></p>
        <p><a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/document/${docId}">View Document</a></p>
    `;
    return sendEmail({ to: userEmail, subject, text: `Document ${documentTitle} is now ${newStatus}`, html });
};

module.exports = {
    sendEmail,
    sendAssignmentNotification,
    sendStatusChangeNotification
};

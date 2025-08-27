import express from 'express';
import nodemailer from 'nodemailer';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// @desc    Send query email
// @route   POST /api/emails/query
// @access  Public
router.post('/query', async (req, res) => {
  try {
    const { name, email, subject, body } = req.body;

    if (!name || !email || !subject || !body) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">New Query Received</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${body.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>This email was sent from College Fair platform</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: 'collegefairtech@gmail.com',
      subject: `New Query: ${subject}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Query received! Tech team is out to get you :-)' });
  } catch (error) {
    console.error('Send query email error:', error);
    res.status(500).json({ error: 'Failed to send query' });
  }
});

// @desc    Send order notification email
// @route   POST /api/emails/order
// @access  Private
router.post('/order', protect, async (req, res) => {
  try {
    const {
      user_email,
      product_owner_email,
      product_name,
      product_price,
      user_Name,
      user_phone,
      product_link,
      payloadRent,
      isSell
    } = req.body;

    let htmlContent;
    let emailSubject;

    if (isSell) {
      emailSubject = '🛒 New Order Received';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Order Received</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Order Details</h2>
              <div style="margin-bottom: 20px;">
                <p><strong>Product:</strong> ${product_name}</p>
                <p><strong>Price:</strong> ₹${product_price}</p>
                <p><strong>Product Link:</strong> <a href="${product_link}" style="color: #667eea;">View Product</a></p>
              </div>
              
              <h3 style="color: #333;">Customer Information</h3>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                <p><strong>Name:</strong> ${user_Name}</p>
                <p><strong>Email:</strong> ${user_email}</p>
                <p><strong>Phone:</strong> ${user_phone}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="${product_link}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      emailSubject = '🏠 New Rental Request';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Rental Request</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Rental Details</h2>
              <div style="margin-bottom: 20px;">
                <p><strong>Product:</strong> ${product_name}</p>
                <p><strong>Daily Rate:</strong> ₹${payloadRent?.dailyRate || 'N/A'}</p>
                <p><strong>Start Date:</strong> ${payloadRent?.startDate || 'N/A'}</p>
                <p><strong>End Date:</strong> ${payloadRent?.endDate || 'N/A'}</p>
                <p><strong>Total Days:</strong> ${payloadRent?.totalDays || 'N/A'}</p>
                <p><strong>Total Amount:</strong> ₹${product_price}</p>
                <p><strong>Product Link:</strong> <a href="${product_link}" style="color: #667eea;">View Product</a></p>
              </div>
              
              <h3 style="color: #333;">Customer Information</h3>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                <p><strong>Name:</strong> ${user_Name}</p>
                <p><strong>Email:</strong> ${user_email}</p>
                <p><strong>Phone:</strong> ${user_phone}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="${product_link}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Rental Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: product_owner_email,
      subject: emailSubject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send order email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// @desc    Send welcome email
// @route   POST /api/emails/welcome
// @access  Public
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to College Fair!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your college marketplace</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}! 👋</h2>
            <p style="color: #666; line-height: 1.6;">
              Welcome to College Fair! We're excited to have you join our community of students buying, selling, and trading items.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What you can do:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>🛍️ Buy and sell items from fellow students</li>
                <li>🏠 Rent items for short-term use</li>
                <li>⭐ Rate and review products</li>
                <li>💝 Add items to your favorites</li>
                <li>📱 Chat with buyers and sellers</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://college-fair-rust.vercel.app" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Start Exploring</a>
            </div>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>College Fair - Connecting students through commerce</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Welcome to College Fair! 🎉',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

export default router;

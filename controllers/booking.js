const Razorpay = require('razorpay');
const crypto = require('crypto');
const Listing = require('../models/listing');
const Booking = require('../models/booking');

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const MAX_BOOKING_AMOUNT_INR = Number(process.env.MAX_BOOKING_AMOUNT_INR || 500000);

function normalizeWhatsAppNumber(value = '') {
    return String(value).replace(/\D/g, '');
}

function safeValue(value, fallback = 'N/A') {
    if (value === undefined || value === null) return fallback;
    const text = String(value).trim();
    return text || fallback;
}

function buildWhatsAppMessage({ listing, booking, user }) {
    const customerName = user?.username || user?.email || 'Guest';
    const customerEmail = user?.email || 'N/A';
    const customerPhone = user?.phone || user?.mobile || user?.phoneNumber || 'N/A';
    return [
        'New car booking confirmed',
        `Car: ${listing.title}`,
        `Booking ID: ${booking._id}`,
        '',
        'Customer Details:',
        `Name: ${safeValue(customerName)}`,
        `Email: ${safeValue(customerEmail)}`,
        `Phone: ${safeValue(customerPhone)}`,
        `User ID: ${safeValue(user?._id)}`,
        '',
        'Trip Details:',
        `Pickup: ${safeValue(booking.pickup)}`,
        `Destination: ${safeValue(booking.destination)}`,
        `Purpose: ${safeValue(booking.purpose)}`,
        `Distance: ${booking.distanceKm || 0} km`,
        `Amount Paid: ₹${booking.amountPaid || 0}`,
        `Razorpay Payment ID: ${booking.razorpayPaymentId}`,
    ].join('\n');
}

function buildWhatsAppUrl(phoneNumber, message) {
    const normalized = normalizeWhatsAppNumber(phoneNumber);
    if (!normalized) return '';
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) return null;
    return new Razorpay({ key_id, key_secret });
}

async function sendWhatsAppTextMessage(phoneNumber, message) {
    const normalized = normalizeWhatsAppNumber(phoneNumber);
    if (!normalized) {
        return { sent: false, reason: 'missing-recipient-number' };
    }

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
        return { sent: false, reason: 'whatsapp-api-not-configured' };
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: normalized,
            type: 'text',
            text: { body: message },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        return {
            sent: false,
            reason: `whatsapp-api-error-${response.status}`,
            details: errorBody,
        };
    }

    return { sent: true };
}

module.exports.renderBooking = async (req, res) => {
    console.log('bookingController.renderBooking called, params:', req.params);
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.redirect(`/listings/${id}`);
    }
    res.render('listings/book.ejs', {
        listing,
        razorpayKey: process.env.RAZORPAY_KEY_ID || '',
        orsKey: process.env.ORS_API_KEY || '',
        ownerWhatsappNumber: listing.whatsappNumber || '',
    });
};

module.exports.createOrder = async (req, res) => {
    try {
        const rp = getRazorpayInstance();
        if (!rp) {
            return res.status(500).json({ success: false, error: 'Razorpay API keys not configured on server' });
        }
        const { amount } = req.body; // amount in INR rupees
        const payAmount = Math.max(1, Math.round(Number(amount) || 0));
        if (payAmount > MAX_BOOKING_AMOUNT_INR) {
            return res.status(400).json({
                success: false,
                error: `Booking amount is too high. Please keep total up to Rs ${MAX_BOOKING_AMOUNT_INR.toLocaleString('en-IN')}.`,
            });
        }
        const options = {
            amount: payAmount * 100, // paisa
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };
        const order = await rp.orders.create(options);
        return res.json({ success: true, order });
    } catch (e) {
        console.error('Razorpay create order error', e);
        return res.status(500).json({ success: false, error: 'Unable to create order' });
    }
};

module.exports.confirmPayment = async (req, res) => {
    try {
        const { id } = req.params; // listing id
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pickup, destination, purpose, distanceKm, amount } = req.body;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) return res.status(500).json({ success: false, error: 'Razorpay secret not configured' });

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        const generated_signature = crypto.createHmac('sha256', key_secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Invalid signature' });
        }

        // Save booking
        const ownerWhatsAppNumber = normalizeWhatsAppNumber(listing.whatsappNumber || '');

        const booking = new Booking({
            user: req.user._id,
            listing: id,
            pickup: pickup || '',
            destination: destination || '',
            purpose: purpose || '',
            distanceKm: Number(distanceKm) || 0,
            amountPaid: Number(amount) || 0,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            ownerWhatsappNumber: ownerWhatsAppNumber,
        });
        await booking.save();

        const whatsappNumber = ownerWhatsAppNumber;
        const whatsappMessage = buildWhatsAppMessage({ listing, booking, user: req.user });
        const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);
        const whatsappDelivery = await sendWhatsAppTextMessage(whatsappNumber, whatsappMessage);

        if (!whatsappDelivery.sent) {
            console.warn('Owner WhatsApp auto-send failed:', whatsappDelivery.reason, whatsappDelivery.details || '');
        }

        return res.json({
            success: true,
            bookingId: booking._id,
            whatsappSent: whatsappDelivery.sent,
            whatsappReason: whatsappDelivery.sent ? 'sent' : whatsappDelivery.reason,
            whatsappUrl,
            whatsappNumber: normalizeWhatsAppNumber(whatsappNumber),
        });
    } catch (e) {
        console.error('Payment confirmation error', e);
        return res.status(500).json({ success: false, error: 'Unable to confirm payment' });
    }
};

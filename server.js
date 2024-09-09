const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST route to handle bookings
app.post('/book', upload.single('payment-screenshot'), (req, res) => {
    const { name, email, date, guests, dietaryRestrictions } = req.body;
    const paymentScreenshot = req.file ? req.file.path : null;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: 'New Booking Received',
        text: `New booking received:\n\nName: ${name}\nEmail: ${email}\nDate: ${date}\nGuests: ${guests}\nDietary Restrictions: ${dietaryRestrictions}`,
        attachments: paymentScreenshot ? [{ path: paymentScreenshot }] : []
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error sending email.');
        }
        res.status(200).send('Booking confirmed! You will receive an email shortly.');
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
app.get('/test-email', (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: 'Test Email',
        text: 'This is a test email to confirm email notification setup.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.send('Test email sent successfully');
        }
    });
});


import express from 'express';
import User from './schemas/user.js';
import Review from './schemas/review.js';
import cors from 'cors';
import { userValid } from './validators/user.js';
import  cookieParser  from 'cookie-parser';
import {reviewValid} from './validators/review.js'
import ExcelJs from 'exceljs';
import nodemailer from 'nodemailer';

const app = express();
app.use(cookieParser());

app.use(cors());

const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user:process.env.EMAIL_USER,
        pass:process.env.NODE_MAILER_USER,
    },
});

app.post('/api/send-email/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await User.findById(id);
    console.log('Patient:', patient);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (!patient.email || !patient.newPrescription?.length) {
      return res.status(400).json({ message: 'Missing email or prescriptions' });
    }

    const prescriptionList = patient.newPrescription.map((p, i) => `
      <h4>Prescription ${i + 1}</h4>
      <ul>
        <li><strong>Tablet:</strong> ${p.tablets}</li>
        <li><strong>Dosage:</strong> ${p.dosage}</li>
        <li><strong>Duration:</strong> ${p.duration}</li>
        <li><strong>Date:</strong> ${new Date(p.date).toLocaleDateString()}</li>
      </ul>
    `).join('<hr>');

    const mailOptions = {
      from: `"Ekaveera Healthcare" <${process.env.EMAIL_USER}>`,
      to: patient.email,
      subject: 'Your Prescription Details',
      html: `
        <p>Dear ${patient.name},</p>
        <p>Here is your prescription:</p>
        ${prescriptionList}
        <p>Regards,<br/>Vignan Healthcare Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

app.get('/api/userDetails',async(req,res)=>
{
    try {
        const result=await User.find();
        res.status(200).json(result);
    } catch (error) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/api/userDetails/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user); 
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.post('/api/userDetails', async (req, res) => {
    try {
        const { name,age, email, phno, address,sex, medicalConcern } = req.body;

        const medicalConcernData = medicalConcern || [];
        const valid=userValid.safeParse(req.body);
        if (!valid.success) {
            return res.status(400).json({ error: valid.error.errors });
        }
        else{
            const user = await User.create({
                name,
                age,
                email,
                phno,
                address,
                sex,
                medicalConcern: medicalConcernData
            });

            res.status(201).json({ message: 'User created successfully', user });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

  app.post('/api/review', async (req, res) => {
    try {
      const { name, email, rating, comment } = req.body;
  
      const valid = reviewValid.safeParse(req.body);
      if (!valid.success) {
        // If validation fails, return the errors
        return res.status(400).json({ error: valid.error.errors });
      }
  
      // Proceed with creating the review if validation is successful
      const result = await Review.create({
        name,
        email,
        rating,
        comment,
      });
  
      res.status(201).json({ success: true, message: 'Review created', data: result });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

app.put('/api/userDetails/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { prescription = [], newPrescription = [] } = req.body;

        const updateFields = {};
        if (prescription.length) {
            updateFields.prescription = { $each: prescription };
        }
        if (newPrescription.length) {
            updateFields.newPrescription = { $each: newPrescription };
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $push: updateFields },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.post('/api/review', async (req, res) => {
    try {
      const { name, email, rating, comment } = req.body;

        const valid = reviewValid.safeParse(req.body);
        if (!valid.success) {

  
            const result = await Review.create({
                name,
                email,
                rating,
                comment,
            });
        }
        else{
            return res.status(400).json({ error: valid.error.errors });
        }
      res.status(201).json({ success: true, message: 'Review created', data: result });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
      const result = await Review.find({ rating: { $gt: 3 } }) // Filter reviews with rating > 3
        .sort({ createdAt: -1 }); // Sort by most recently added (createdAt is assumed to be present)
      
      return res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

app.put('/api/userDetail/:id/complete', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(
            id,
            { isCompleted: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User marked as completed', user });
    } catch (error) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
        
    }
});

app.delete('/api/userDetails/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await User.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  
  app.get('/api/download-excel', async (req, res) => {
    try {
      const users = await User.find(); // Get all users from MongoDB
  
      const workbook = new ExcelJs.Workbook();
      const worksheet = workbook.addWorksheet('Users');
  
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone Number', key: 'phno', width: 15 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Sex', key: 'sex', width: 10 },
        { header: 'Medical Concerns', key: 'medicalConcern', width: 40 },
        { header: 'Is Completed', key: 'isCompleted', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
      ];
  
      users.forEach(user => {
        worksheet.addRow({
          name: user.name,
          email: user.email,
          phno: user.phno,
          age: user.age,
          address: user.address,
          sex: user.sex,
          medicalConcern: user.medicalConcern.join(', '), // join array into string
          isCompleted: user.isCompleted ? 'Yes' : 'No',
          createdAt: user.createdAt.toLocaleString(),
        });
      });
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      res.status(500).send('Server Error');
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


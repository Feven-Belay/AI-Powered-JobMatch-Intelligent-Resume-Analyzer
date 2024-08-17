//src/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const mysql = require('mysql2/promise');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Life@123',
    database: 'SRA',
    port: 3306
};

async function initializeDatabase() {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(100) NOT NULL,
            Email_ID VARCHAR(50) NOT NULL UNIQUE,
            Password VARCHAR(255) NOT NULL,
            PhoneNumber VARCHAR(15),
            DateOfBirth DATE,
            Nationality VARCHAR(50),
            Address VARCHAR(255),
            Website VARCHAR(255),
            Profile TEXT,
            WorkExperience JSON,
            Education JSON,
            Skills TEXT,
            Awards TEXT,
            Projects TEXT,
            Publications TEXT,
            TemplateName VARCHAR(100)
        );
    `);
    console.log('Database initialized successfully.');
    await connection.end();
}

initializeDatabase();


app.use(bodyParser.json());

app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    
    // Validate the input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Example validation for email and password
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Simulate successful signup
    res.status(200).json({ message: 'Signup successful', name });
});

app.listen(5003, () => {
    console.log('Server running on http://localhost:5003');
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            `SELECT * FROM users WHERE Email_ID = ?`,
            [email]
        );
        await connection.end();

        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.Password);

            if (match) {
                const token = jwt.sign({ userId: user.ID }, 'secret_key', { expiresIn: '1h' });
                res.json({ message: 'Login successful', token });
            } else {
                res.status(401).json({ message: 'Invalid email or password.' });
            }
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user.' });
    }
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

app.post('/analyze_resume', upload.single('file'), async (req, res) => {
    if (!req.file || !req.body.jobDescription) {
        return res.status(400).json({ message: 'No file or job description provided' });
    }

    const filePath = req.file.path;
    const jobDescription = req.body.jobDescription;
    const command = `python3 parse_resume.py "${filePath}" "${jobDescription}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error processing file:', error);
            return res.status(500).json({ error: 'Error processing file', stdout: stdout, stderr: stderr });
        }

        try {
            const trimmedOutput = stdout.trim();
            const resumeData = JSON.parse(trimmedOutput);

            if (!resumeData || typeof resumeData !== 'object' || !resumeData.name) {
                throw new Error("Essential data missing from Python script output.");
            }

            res.json({ message: 'Resume analyzed successfully', data: resumeData });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).json({ error: 'Error parsing JSON', details: stderr });
        }
    });
});

app.post('/save_resume', async (req, res) => {
    const { personalInfo, workExperience, education, skills, awards, projects, publications, templateName } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            `INSERT INTO users 
            (Name, Email_ID, PhoneNumber, DateOfBirth, Nationality, Address, Website, Profile, WorkExperience, Education, Skills, Awards, Projects, Publications, TemplateName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                Name = VALUES(Name), 
                PhoneNumber = VALUES(PhoneNumber),
                DateOfBirth = VALUES(DateOfBirth),
                Nationality = VALUES(Nationality),
                Address = VALUES(Address),
                Website = VALUES(Website),
                Profile = VALUES(Profile),
                WorkExperience = VALUES(WorkExperience),
                Education = VALUES(Education),
                Skills = VALUES(Skills),
                Awards = VALUES(Awards),
                Projects = VALUES(Projects),
                Publications = VALUES(Publications),
                TemplateName = VALUES(TemplateName)`,
            [
                `${personalInfo.firstName} ${personalInfo.lastName}`,
                personalInfo.email,
                personalInfo.phoneNumber,
                personalInfo.dateOfBirth,
                personalInfo.nationality,
                personalInfo.address,
                personalInfo.website,
                personalInfo.profile,
                JSON.stringify(workExperience),
                JSON.stringify(education),
                skills,
                awards,
                projects,
                publications,
                templateName
            ]
        );

        await connection.end();
        res.status(200).json({ message: 'Resume saved successfully.' });
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({ message: 'Error saving resume.' });
    }
});




app.post('/generate_pdf', async (req, res) => {
    const { personalInfo, workExperience, education, skills, awards, projects, publications, templateName } = req.body;

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'uploads', 'resume.pdf');
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text(`${personalInfo.firstName} ${personalInfo.lastName}`, { align: 'center' });
    doc.fontSize(14).text(`Email: ${personalInfo.email}`, { align: 'center' });
    doc.fontSize(14).text(`Phone: ${personalInfo.phoneNumber}`, { align: 'center' });
    doc.fontSize(14).text(`Date of Birth: ${personalInfo.dateOfBirth}`, { align: 'center' });
    doc.fontSize(14).text(`Nationality: ${personalInfo.nationality}`, { align: 'center' });
    doc.fontSize(14).text(`Address: ${personalInfo.address}`, { align: 'center' });
    doc.fontSize(14).text(`Website: ${personalInfo.website}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(18).text('Profile', { underline: true });
    doc.fontSize(14).text(personalInfo.profile || 'N/A');
    doc.moveDown();

    doc.fontSize(18).text('Work Experience', { underline: true });
    workExperience.forEach(exp => {
        doc.fontSize(16).text(`${exp.jobTitle} at ${exp.company}`);
        doc.fontSize(14).text(`From ${exp.startDate} to ${exp.endDate}`);
        doc.fontSize(14).text(exp.description || 'No description provided');
        doc.moveDown();
    });

    doc.fontSize(18).text('Education', { underline: true });
    education.forEach(edu => {
        doc.fontSize(16).text(`${edu.degree} at ${edu.institution}`);
        doc.fontSize(14).text(`Graduated in ${edu.graduationYear}`);
        doc.moveDown();
    });

    doc.fontSize(18).text('Skills', { underline: true });
    doc.fontSize(14).text(skills || 'No skills provided');
    doc.moveDown();

    doc.fontSize(18).text('Awards', { underline: true });
    doc.fontSize(14).text(awards || 'No awards provided');
    doc.moveDown();

    doc.fontSize(18).text('Projects', { underline: true });
    doc.fontSize(14).text(projects || 'No projects provided');
    doc.moveDown();

    doc.fontSize(18).text('Publications', { underline: true });
    doc.fontSize(14).text(publications || 'No publications provided');
    doc.moveDown();

    doc.end();

    writeStream.on('finish', () => {
        res.status(200).json({ message: 'PDF generated successfully', filePath: `/uploads/resume.pdf` });
    });

    writeStream.on('error', (error) => {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    });
});




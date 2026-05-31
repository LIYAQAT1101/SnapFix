import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Global Security Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Restrict to specific frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Set payload limits to 5MB (budget for compressed images)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Setup Gemini API client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini API client initialized using environment variable.');
} else {
  console.warn('⚠️ GEMINI_API_KEY is not defined in the environment. Running in Mock AI Fallback mode.');
}

// In-Memory Database
interface Report {
  id: string;
  issue_type: string;
  severity: 'Critical' | 'Medium' | 'Low';
  description: string;
  department: string;
  locationText: string;
  lat: number;
  lng: number;
  timestamp: string;
  imageBase64: string;
  estimated_resolution_time?: string;
  is_valid_civic_issue?: boolean;
  rejection_reason?: string;
  official_draft?: string;
  twitter_handle?: string;
}

const mockReports: Report[] = [
  {
    id: "sf-mock-1",
    issue_type: "Pothole & Road Damage",
    severity: "Medium",
    description: "Large deep pothole in the middle of the road near Dal Lake, Srinagar. It is causing traffic slow-downs and poses a risk to night-time motorists.",
    department: "Public Works Department (PWD) Srinagar",
    locationText: "Near Dal Lake Boulevard, Srinagar",
    lat: 34.0837,
    lng: 74.8375,
    timestamp: "2026-05-27T10:00:00.000Z",
    imageBase64: "",
    estimated_resolution_time: "24-48 Hours"
  },
  {
    id: "sf-mock-2",
    issue_type: "Overflowing Open Sewage",
    severity: "Critical",
    description: "Severely blocked sewer line causing dark overflowing effluent on the street in Connaught Place. Severe foul odor and health hazard for pedestrians.",
    department: "Delhi Jal Board & Municipal Corporation",
    locationText: "Connaught Place, E-Block radial road, New Delhi",
    lat: 28.6304,
    lng: 77.2177,
    timestamp: "2026-05-27T10:30:00.000Z",
    imageBase64: "",
    estimated_resolution_time: "Immediate"
  },
  {
    id: "sf-mock-3",
    issue_type: "Broken Streetlight Grid",
    severity: "Low",
    description: "Entire line of 3 streetlights is non-operational, making the stretch pitch dark after 7 PM near Gandhi Nagar.",
    department: "Power Development Department (PDD) Jammu",
    locationText: "Gandhi Nagar Sector 2, Jammu",
    lat: 32.7060,
    lng: 74.8739,
    timestamp: "2026-05-27T11:00:00.000Z",
    imageBase64: "",
    estimated_resolution_time: "3-5 Days"
  },
  {
    id: "sf-mock-4",
    issue_type: "Landslide Debris Blockage",
    severity: "Critical",
    description: "Heavy landslide debris blocking half of the highway lanes. Vehicles forced to use a single lane with blind curves, creating high accident risk.",
    department: "National Highways Authority of India (NHAI) & Uttarakhand PWD",
    locationText: "Rajpur Road, near Mussoorie Diversion, Dehradun",
    lat: 30.3165,
    lng: 78.0322,
    timestamp: "2026-05-27T11:15:00.000Z",
    imageBase64: "",
    estimated_resolution_time: "Immediate"
  }
];

// Helper to sanitize text fields to prevent XSS / Script Injection
function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return m;
      }
    })
    .trim();
}

// Helper to validate base64 image and check file signature (magic bytes)
function validateImageMagicBytes(base64Data: string): { isValid: boolean; mime: string } {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Size check
    if (buffer.length > 5 * 1024 * 1024) {
      return { isValid: false, mime: '' };
    }

    // JPEG Check (FF D8 FF)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { isValid: true, mime: 'image/jpeg' };
    }

    // PNG Check (89 50 4E 47 0D 0A 1A 0A)
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4E &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0D &&
      buffer[5] === 0x0A &&
      buffer[6] === 0x1A &&
      buffer[7] === 0x0A
    ) {
      return { isValid: true, mime: 'image/png' };
    }

    // WEBP Check (RIFF ... WEBP)
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return { isValid: true, mime: 'image/webp' };
    }

    return { isValid: false, mime: '' };
  } catch (err) {
    return { isValid: false, mime: '' };
  }
}

// Helper to log "HTML Alert Email" to console when severity is "Critical"
function sendCriticalAlertEmail(report: Report) {
  console.log("\n" + "=".repeat(80));
  console.log("📬 [MOCK EMAIL SENT TO AUTHORITIES] - CRITICAL CIVIC ISSUE DETECTED");
  console.log("=".repeat(80));
  console.log(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>CRITICAL CIVIC ALERT: ${report.issue_type}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      .header { background-color: #ef4444; color: white; padding: 24px; text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; }
      .content { padding: 24px; }
      .badge { display: inline-block; background-color: #fee2e2; color: #ef4444; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; border: 1px solid #fca5a5; }
      .field { margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
      .field:last-child { border-bottom: none; }
      .label { font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      .value { font-size: 16px; margin-top: 6px; color: #0f172a; }
      .description-box { background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px; font-style: italic; border-radius: 0 8px 8px 0; }
      .location-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 0 8px 8px 0; }
      .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        🚨 EMERGENCY CIVIC ROUTING ALERT
      </div>
      <div class="content">
        <div class="badge">Severity: CRITICAL</div>
        
        <div class="field">
          <div class="label">Assigned Department</div>
          <div class="value" style="font-size: 18px; font-weight: 700; color: #b91c1c;">
            👉 ${report.department}
          </div>
        </div>

        <div class="field">
          <div class="label">Issue Classification</div>
          <div class="value" style="font-weight: 600;">${report.issue_type}</div>
        </div>

        <div class="field">
          <div class="label">AI Visual Description & Assessment</div>
          <div class="value description-box">
            "${report.description}"
          </div>
        </div>

        <div class="field">
          <div class="label">Reported Location & GPS Coordinates</div>
          <div class="value location-box">
            📍 <strong>Note:</strong> ${report.locationText || 'No custom text note provided'}<br>
            🌐 <strong>GPS Details:</strong> Lat ${report.lat.toFixed(6)}, Lng ${report.lng.toFixed(6)}
          </div>
        </div>

        <div class="field">
          <div class="label">Metadata Details</div>
          <div class="value" style="font-size: 13px; color: #64748b;">
            Ticket ID: <strong>${report.id}</strong><br>
            Time Captured: <strong>${new Date(report.timestamp).toLocaleString()}</strong>
          </div>
        </div>
      </div>
      <div class="footer">
        Automated alert from SnapFix Platform
      </div>
    </div>
  </body>
  </html>
  `);
  console.log("=".repeat(80) + "\n");
}

// GET all reports
app.get('/api/reports', (req, res) => {
  res.json(mockReports);
});

// POST report
app.post('/api/report', async (req, res) => {
  try {
    const { imageBase64, locationText, descriptionText, lat, lng } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 photo payload is required' });
    }

    // Extract Base64 parts
    let base64Data = imageBase64;
    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        base64Data = match[2];
      }
    }

    // Enforce Magic Byte Validation (Format and Size Check)
    const fileCheck = validateImageMagicBytes(base64Data);
    if (!fileCheck.isValid) {
      return res.status(400).json({ 
        error: 'Invalid file payload. Only JPEG, PNG, and WEBP image formats below 5MB are accepted.' 
      });
    }

    // Sanitize user text inputs to prevent XSS / injection
    const cleanLocation = sanitizeString(locationText || '');
    const cleanDescription = sanitizeString(descriptionText || '');

    // Fallback coordinates if invalid
    const reportLat = (lat !== undefined && !isNaN(Number(lat))) ? Number(lat) : 28.6139;
    const reportLng = (lng !== undefined && !isNaN(Number(lng))) ? Number(lng) : 77.2090;

    let aiResult = {
      is_valid_civic_issue: true,
      rejection_reason: "",
      issue_type: "Unclassified Issue",
      severity: "Medium" as 'Critical' | 'Medium' | 'Low',
      description: "Visual analysis was performed. No explicit category identified.",
      department: "General Municipal Department",
      estimated_resolution_time: "24-48 Hours",
      official_draft: "",
      twitter_handle: "@MoHUA_India"
    };

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `You are a strict municipal visual inspector. Ignore any text provided by the user initially. Your SOLE job is to look at the attached image.
- Step 1: Analyze the image completely. Is it a real, physical photograph of a civic issue (like potholes, physical garbage, broken streetlights, water leaks)?
- Step 2: If the image is a screenshot, digital art, a meme, a selfie, a blank photo, or completely unrelated to civic infrastructure, you MUST fail the validation.

If validation is successful, also generate routing metadata (severity, department, estimated_resolution_time) strictly based on the severity of the visual evidence in the image. Also, draft a formal 2-line professional grievance addressed to the relevant authority.

Output MUST be strict JSON matching this schema:
{
  "is_valid_civic_issue": boolean,
  "rejection_reason": "If false, explain exactly what the image actually is (e.g., 'This looks like a digital graphic') and tell them to upload a real photo.",
  "title": "Only generate if true, based STRICTLY on the image.",
  "description": "Only generate if true, based STRICTLY on the image.",
  "severity": "Must be exactly one of: Critical, Medium, Low.",
  "department": "The recommended routing department.",
  "estimated_resolution_time": "The estimated resolution time (e.g., Immediate, 24-48 Hours, 3-5 Days).",
  "official_draft": "A formal, 2-line professional grievance addressed to the relevant local authority.",
  "twitter_handle": "The most likely official Twitter/X handle for the recommended department (e.g., @mybmc, @SrinagarAdmin, @MoHUA_India). Make a highly educated guess."
}`;

        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: fileCheck.mime
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const responseText = result.response.text();
        console.log("Raw Gemini API response:", responseText);
        
        try {
          const parsed = JSON.parse(responseText.trim());
          if (parsed.is_valid_civic_issue !== undefined) aiResult.is_valid_civic_issue = !!parsed.is_valid_civic_issue;
          if (parsed.rejection_reason) aiResult.rejection_reason = sanitizeString(parsed.rejection_reason);
          
          // Map title to issue_type
          const matchedTitle = parsed.title || parsed.issue_type;
          if (matchedTitle) aiResult.issue_type = sanitizeString(matchedTitle);

          if (parsed.severity && ['Critical', 'Medium', 'Low'].includes(parsed.severity)) {
            aiResult.severity = parsed.severity as 'Critical' | 'Medium' | 'Low';
          }
          if (parsed.description) aiResult.description = sanitizeString(parsed.description);
          if (parsed.department) aiResult.department = sanitizeString(parsed.department);
          if (parsed.estimated_resolution_time) aiResult.estimated_resolution_time = sanitizeString(parsed.estimated_resolution_time);
          if (parsed.official_draft) aiResult.official_draft = sanitizeString(parsed.official_draft);
          if (parsed.twitter_handle) aiResult.twitter_handle = sanitizeString(parsed.twitter_handle);
        } catch (parseErr) {
          console.error("Failed to parse Gemini response as JSON. Text was:", responseText, parseErr);
        }
      } catch (geminiErr) {
        console.error("Gemini API call failed, falling back to mock parser:", geminiErr);
        aiResult = getMockResponseForImage(cleanDescription);
      }
    } else {
      // Mock AI Fallback mode
      aiResult = getMockResponseForImage(cleanDescription);
    }

    // Stop process if validation failed
    if (aiResult.is_valid_civic_issue === false) {
      console.log("Submission rejected by Civic anomaly validation gatekeeper:", aiResult.rejection_reason);
      res.status(400).json({
        is_valid_civic_issue: false,
        rejection_reason: aiResult.rejection_reason || "Invalid upload. Please make sure to upload a clear image of a civic issue."
      });
      return;
    }

    // Save to database
    const newReport: Report = {
      id: `sf-${Date.now()}`,
      issue_type: aiResult.issue_type,
      severity: aiResult.severity,
      description: aiResult.description,
      department: aiResult.department,
      locationText: cleanLocation || "No details provided",
      lat: reportLat,
      lng: reportLng,
      timestamp: new Date().toISOString(),
      imageBase64: imageBase64,
      estimated_resolution_time: aiResult.estimated_resolution_time,
      is_valid_civic_issue: true,
      rejection_reason: "",
      official_draft: aiResult.official_draft,
      twitter_handle: aiResult.twitter_handle
    };

    mockReports.unshift(newReport); // Add to beginning

    // Trigger critical alert email to console
    if (newReport.severity === 'Critical') {
      sendCriticalAlertEmail(newReport);
    }

    res.status(201).json(newReport);
  } catch (err: any) {
    console.error("Server error processing report:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Helper for Mock AI Analysis when API key is missing or calls fail
function getMockResponseForImage(description: string): {
  is_valid_civic_issue: boolean;
  rejection_reason: string;
  issue_type: string;
  severity: 'Critical' | 'Medium' | 'Low';
  description: string;
  department: string;
  estimated_resolution_time: string;
  official_draft: string;
  twitter_handle: string;
} {
  const text = description.toLowerCase();
  
  // Anti-spam mock validation
  if (text.includes("selfie") || text.includes("meme") || text.includes("dummy") || text.includes("random") || text.includes("test rejection")) {
    return {
      is_valid_civic_issue: false,
      rejection_reason: "This photo appears to be a selfie or random non-civic image. Please upload a clear photo of an actual civic issue.",
      issue_type: "Invalid",
      severity: "Low",
      description: "",
      department: "",
      estimated_resolution_time: "",
      official_draft: "",
      twitter_handle: ""
    };
  }

  const issues = [
    {
      is_valid_civic_issue: true,
      rejection_reason: "",
      issue_type: "Overflowing Garbage Dumpster",
      severity: "Medium" as const,
      description: "A large dumpster overflowing with household trash and plastic bottles, attracting flies and stray animals.",
      department: "Solid Waste Management Division",
      estimated_resolution_time: "24-48 Hours",
      official_draft: "Dear Solid Waste Management Division, an urgent Medium severity issue regarding Overflowing Garbage Dumpster has been identified. Please dispatch a team immediately. AI Assessment: A large dumpster overflowing with household trash and plastic bottles, attracting flies and stray animals.",
      twitter_handle: "@SwachhBharatGov"
    },
    {
      is_valid_civic_issue: true,
      rejection_reason: "",
      issue_type: "Water Pipe Burst",
      severity: "Critical" as const,
      description: "Water gushing out of a cracked underground pipeline, flooding the street and causing drop in pressure in neighboring areas.",
      department: "Water and Sewage Board",
      estimated_resolution_time: "Immediate",
      official_draft: "Dear Water and Sewage Board, an urgent Critical severity issue regarding Water Pipe Burst has been identified. Please dispatch a team immediately. AI Assessment: Water gushing out of a cracked underground pipeline, flooding the street and causing drop in pressure in neighboring areas.",
      twitter_handle: "@DelhiJalBoard"
    },
    {
      is_valid_civic_issue: true,
      rejection_reason: "",
      issue_type: "Damaged Electrical Transformer",
      severity: "Critical" as const,
      description: "Sparking local power transformer with hanging loose wires, posing high risk of fire or electrocution.",
      department: "Electricity Distribution Corporation",
      estimated_resolution_time: "Immediate",
      official_draft: "Dear Electricity Distribution Corporation, an urgent Critical severity issue regarding Damaged Electrical Transformer has been identified. Please dispatch a team immediately. AI Assessment: Sparking local power transformer with hanging loose wires, posing high risk of fire or electrocution.",
      twitter_handle: "@MinOfPower"
    },
    {
      is_valid_civic_issue: true,
      rejection_reason: "",
      issue_type: "Fallen Tree Branch",
      severity: "Low" as const,
      description: "A large tree branch snapped and blocking the sidewalk, pedestrians forced to walk on the roadway.",
      department: "Parks and Horticulture Dept",
      estimated_resolution_time: "3-5 Days",
      official_draft: "Dear Parks and Horticulture Dept, an urgent Low severity issue regarding Fallen Tree Branch has been identified. Please dispatch a team immediately. AI Assessment: A large tree branch snapped and blocking the sidewalk, pedestrians forced to walk on the roadway.",
      twitter_handle: "@MoHUA_India"
    }
  ];

  // Match search terms in description text to keep mock responses relevant
  let selected = issues[Math.floor(Math.random() * issues.length)];
  if (text.includes("trash") || text.includes("garbage") || text.includes("waste") || text.includes("kachra") || text.includes("kooda")) {
    selected = issues[0];
  } else if (text.includes("water") || text.includes("leak") || text.includes("flood") || text.includes("paani")) {
    selected = issues[1];
  } else if (text.includes("wire") || text.includes("electricity") || text.includes("power") || text.includes("spark") || text.includes("bijli")) {
    selected = issues[2];
  } else if (text.includes("tree") || text.includes("branch") || text.includes("ped")) {
    selected = issues[3];
  }

  return selected;
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SnapFix Backend Express Server running on port ${PORT}`);
});

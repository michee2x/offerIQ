# Sales Report Feature - Installation & Setup Guide

## Required NPM Packages

Install the following packages:

```bash
npm install pdf-parse mammoth react-markdown remark-gfm react-hook-form @hookform/resolvers zod date-fns
```

### Package Breakdown:

- **pdf-parse** - Extract text from PDF files
- **mammoth** - Extract text from Word documents (.docx)
- **react-markdown** - Render markdown content in React
- **remark-gfm** - GitHub Flavored Markdown support for react-markdown
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Validation resolvers for react-hook-form
- **zod** - Schema validation
- **date-fns** - Date formatting utilities

## Environment Variables

Add to your `.env.local` file:

```env
# OpenAI API Key (for Whisper transcription and report generation)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Setup

1. Run the SQL schema in your Supabase SQL editor:
   - File: `database/sales_report_schema.sql`

2. Create Supabase Storage Bucket:
   - Go to Supabase Dashboard → Storage
   - Create new bucket named: `offer-files`
   - Set to **Private** (we'll use signed URLs)

## File Structure Created

```
src/
├── app/
│   ├── actions/
│   │   ├── offer-context.ts       # Offer context CRUD
│   │   ├── offer-files.ts         # File upload & processing
│   │   └── sales-report.ts        # Sales report CRUD & generation
│   ├── api/
│   │   └── upload-offer-file/
│   │       └── route.ts           # File upload API endpoint
│   └── workspace/
│       └── [workspaceId]/
│           └── sales-reports/
│               ├── page.tsx       # Reports list
│               ├── new/
│               │   └── page.tsx   # Create new report
│               └── [reportId]/
│                   └── page.tsx   # Edit report
├── components/
│   └── sales-report/
│       ├── file-upload.tsx        # Drag-and-drop file upload
│       ├── markdown-editor.tsx    # Markdown editor with preview
│       └── offer-context-form.tsx # Offer context form
├── lib/
│   ├── content-extraction.ts      # PDF, Word, audio/video extraction
│   ├── report-generation.ts       # AI report generation
│   └── storage.ts                 # Supabase storage utilities
├── types/
│   └── sales-report.ts            # TypeScript types
└── database/
    └── sales_report_schema.sql    # Database schema
```

## Features Implemented

### 1. File Upload & Processing
- Drag-and-drop file upload
- Support for: PDF, Word, Video (MP4, MOV), Audio (MP3, WAV)
- Automatic content extraction:
  - PDF → Text extraction
  - Word → Text extraction
  - Video/Audio → Transcription via OpenAI Whisper
- AI-powered content summarization
- Background processing with status tracking

### 2. Offer Context Collection
- Multi-step form wizard
- Validation with Zod
- Fields:
  - Product name, category
  - Target audience
  - Main problem solved
  - Key features
  - Price point
  - Geographic focus
  - Unique selling proposition
  - Additional context

### 3. AI Report Generation
- 14 strategic sections:
  1. Offer Positioning Analysis
  2. Revenue Model Architecture
  3. Target Persona Intelligence
  4. Pain Point Mapping
  5. Conversion Hook Library
  6. Funnel Structure Blueprint
  7. Pricing Strategy
  8. Upsell/Downsell Paths
  9. Strategic Bonus Recommendations
  10. Messaging Angle Matrix
  11. Funnel Health Score
  12. Monetization Strategy Narrative
  13. Real-World Use Case Scenarios
  14. Product Core Value Perception

- Uses GPT-4o for generation
- Streaming support (ready for implementation)
- Section regeneration capability

### 4. Markdown Editor
- Edit/Preview modes
- Auto-save every 30 seconds
- Manual save button
- GitHub Flavored Markdown support
- Clean, readable interface

### 5. Report Management
- List all reports
- Status tracking (draft, generating, complete, archived)
- Version control
- Delete reports
- Export (ready for implementation)

## Usage Flow

1. **Create Report**: Navigate to Sales Reports → New Report
2. **Enter Title**: Give your report a descriptive title
3. **Upload Files** (Optional): Upload offer files for analysis
4. **Fill Context Form**: Provide detailed offer information
5. **AI Generation**: AI generates comprehensive 14-section report
6. **Edit & Refine**: Use markdown editor to refine the report
7. **Save & Use**: Use report to generate sales copy and funnels

## Cost Estimates

### Per Report:
- File transcription (1-hour video): ~$0.36
- Content summarization: ~$0.01
- Report generation (14 sections): ~$0.20
- **Total: ~$0.60 per report**

### Storage:
- Supabase free tier: 1GB
- Paid tier: $0.25/GB/month

## Next Steps (Optional Enhancements)

1. **AI Refinement Sidebar**: Chat interface to refine sections
2. **Export Functionality**: Export to PDF, DOCX, etc.
3. **Report Templates**: Pre-built templates for common industries
4. **Collaboration**: Share reports with team members
5. **Analytics**: Track report usage and effectiveness
6. **Integration**: Link reports to sales copy and funnel generation

## Troubleshooting

### File Upload Issues
- Check Supabase storage bucket is created and named `offer-files`
- Verify service role key has storage permissions

### Transcription Failures
- Ensure OPENAI_API_KEY is set correctly
- Check file format is supported
- Verify file size is under OpenAI limits (25MB for Whisper)

### Report Generation Errors
- Check OpenAI API key and credits
- Verify offer context is complete
- Check server logs for detailed errors

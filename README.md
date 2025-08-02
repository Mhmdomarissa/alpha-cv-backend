# CV Analyzer Frontend

A modern, enterprise-grade frontend application for the AI-powered CV Analyzer Platform. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **AI-Powered Analysis**: Leverage GPT-4 for intelligent CV matching
- **Drag & Drop Upload**: Easy file upload with support for PDF, DOC, DOCX, and TXT
- **Real-time Processing**: Visual progress tracking during analysis
- **Smart Matching**: Get detailed match scores, strengths, gaps, and recommendations
- **Database Management**: View and manage uploaded CVs and job descriptions
- **Export Results**: Download analysis results as CSV
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query v5
- **UI Components**: Custom components with Radix UI
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-analyzer-frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create environment variables (optional):
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://13.61.179.54:8000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
cv-analyzer-frontend/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utilities and API client
│   ├── stores/          # Zustand state management
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## Key Components

- **UploadPage**: Handles job description input and CV uploads
- **DatabasePage**: Displays stored CVs and job descriptions
- **ResultsPage**: Shows analysis results with match scores
- **FileUpload**: Drag-and-drop file upload component
- **Layout**: Main application layout with navigation

## API Integration

The frontend connects to the backend API at `http://13.61.179.54:8000`. Key endpoints:

- `/health` - Health check
- `/api/jobs/upload-cv` - Upload CV files
- `/api/jobs/upload-jd` - Upload job descriptions
- `/api/jobs/analyze-and-match` - Perform AI analysis
- `/api/jobs/list-cvs` - List all CVs
- `/api/jobs/list-jds` - List all job descriptions

## Development Tips

1. **State Management**: Global state is managed with Zustand. Check `src/stores/appStore.ts`
2. **API Calls**: All API methods are centralized in `src/lib/api.ts`
3. **Styling**: Uses Tailwind CSS with custom color palette defined in `tailwind.config.ts`
4. **Components**: Follow the component structure in `src/components/ui` for consistency

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
pkill -f "node.*3000"
# or
lsof -ti:3000 | xargs kill
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules/.cache
npm install --legacy-peer-deps
npm run build
```

### API Connection Issues
- Verify backend is running at `http://13.61.179.54:8000`
- Check browser console for CORS errors
- Ensure network connectivity

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
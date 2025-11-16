🎓 AI-Powered Lecture Notes Generator

Transform your audio lectures into comprehensive, organized study notes in seconds.

📖 Table of Contents

🚀 Introduction

✨ Features

🛠️ Tech Stack

🏗️ Architecture

📸 Screenshots

🏁 Getting Started

Prerequisites

Installation

Environment Setup

💡 Usage

🤝 Contributing

📄 License

👥 Authors

🚀 Introduction

Lecture Summarizer AI is a modern web application designed to revolutionize the way students engage with lecture material. By leveraging advanced Artificial Intelligence, this tool solves the "cognitive overload" problem of trying to listen and write simultaneously.

Users simply upload an audio recording of a lecture, and the system automatically:

Transcribes the spoken audio into text with high accuracy.

Analyzes the content to understand context and key themes.

Generates a structured set of notes, including a concise summary and bulleted key points.

Focus on understanding the lecture in real-time, and let AI handle the note-taking.

✨ Features

  🎙️ Audio Transcription: Upload .mp3 or .wav files and get highly accurate, word-for-word text transcripts using state-of-the-art AI models.

  📝 Intelligent Summarization: Automatically generates a clear, concise summary of the entire lecture.

  🔑 Key Points Extraction: Identifies and lists crucial definitions, dates, and concepts in a bulleted format for easy revision.

  ⚡ Fast Processing: Processes hour-long lectures in minutes using asynchronous background jobs.

  🎨 Modern UI: A clean, dark-themed, user-friendly interface built with React and Tailwind CSS.

  🔒 Secure Storage: Your audio files are securely uploaded and processed via Supabase Storage.

  🛠️ Tech Stack

This project uses a robust, modern full-stack architecture:

Frontend

   React: The library for web and native user interfaces.

   TypeScript: Strongly typed JavaScript for safer code.

   Vite: Next Generation Frontend Tooling for blazing fast builds.

   Tailwind CSS: A utility-first CSS framework for rapid UI development.

   shadcn/ui: Beautifully designed components built with Radix UI and Tailwind CSS.

Backend & Services

   Supabase: The open source Firebase alternative. Used for:

   Storage: securely hosting audio files.

   Database: (Optional extension) Storing user note history.

AI APIs:

   Transcription: OpenAI Whisper (or similar STT service).

   Summarization: OpenAI GPT-4o (or similar LLM).

🏗️ Architecture

  The system follows a streamlined data flow:

  User uploads audio file via the React Frontend.

  File is securely stored in Supabase Storage.

  AI Service retrieves the file and performs Speech-to-Text (STT).

  The raw transcript is sent to the LLM for summarization and formatting.
 
  Final Notes are returned and displayed to the user.

📸 Screenshots

1. Dashboard
   <img width="1920" height="1080" alt="Screenshot 2025-11-14 090412" src="https://github.com/user-attachments/assets/2056ba8f-a887-404a-86f0-ea805bebac4d" />
   Clean, intuitive upload interface

3. File Upload
   <img width="1920" height="1080" alt="Screenshot 2025-11-14 090500" src="https://github.com/user-attachments/assets/bde1a50c-0418-41d1-b5a6-9d7253183da0" />

   Drag & drop or select files

3. Processing
    <img width="1920" height="1080" alt="Screenshot 2025-11-14 090531" src="https://github.com/user-attachments/assets/8d4c1fd9-8b9b-4996-aa5b-912175becea5" />


5. Final Notes
    <img width="1920" height="1080" alt="Screenshot 2025-11-14 090627" src="https://github.com/user-attachments/assets/42a776ed-4d96-46be-8453-bc0da491f333" />




 Real-time status updates



 Organized summary & key points

🏁 Getting Started

Follow these steps to get a local copy up and running.

Prerequisites

Ensure you have the following installed on your machine:

Node.js (v16 or higher)

npm (usually comes with Node.js) or yarn

Installation

Clone the repository

git clone [https://github.com/rohanreddy-619/lecture-summarizer-ai.git](https://github.com/rohanreddy-619/lecture-summarizer-ai.git)
cd lecture-summarizer-ai


Install dependencies

npm install
# or
yarn install


Environment Setup

Create a .env file in the root directory.

Add your API keys (you will need keys for OpenAI and Supabase):

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key


Start the development server

npm run dev
# or
yarn dev


Open your browser and navigate to http://localhost:5173 (or the port shown in your terminal).

💡 Usage

Upload: Click the "Upload Audio File" button and select your lecture recording (MP3/WAV).

Transcribe: Click the microphone icon to start the transcription process. Wait for the "Transcription Complete" notification.

Generate: Click the "Generate Notes" button to let the AI analyze the text.

Study: Review your generated summary and key points. You can copy them to your clipboard or download them (feature coming soon).

🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Distributed under the MIT License. See LICENSE for more information.

👥 Authors

CHANDI ROHAN - Team Lead & Full Stack Developer - GitHub Profile

PRATHUSH KUMAR - Frontend Developer

SAI VARSHITH - Backend Developer

NISHI VARDHAN  - UI/UX Designer

UDAY KIRAN - QA & Documentation

<div align="center">
Made with ❤️ by the Lecture Summarizer Team
</div>

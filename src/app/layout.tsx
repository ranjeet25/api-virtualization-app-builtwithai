import type { Metadata } from 'next';
import './globals.css';
import { QAProvider } from '@/context/QAStateContext';
import { Navbar } from '@/components/layout/Navbar';
import { ToastContainer } from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'QA API Virtualization & Outage Switch Console',
  description: 'Mission-critical QA Telemetry, API virtualization, fault injection, and mock routing dashboard for REST and SOAP services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-[#dae2fd] min-h-screen flex flex-col font-sans selection:bg-indigo-600/30 selection:text-white antialiased">
        <QAProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <ToastContainer />
        </QAProvider>
      </body>
    </html>
  );
}

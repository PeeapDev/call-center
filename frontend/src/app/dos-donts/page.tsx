'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, CheckCircle, XCircle } from 'lucide-react';

const guidelines = [
  {
    category: 'When Calling Our Support Line',
    dos: [
      'Have your student ID or reference number ready before calling',
      'Call during office hours (Monday-Friday, 8AM-6PM) for faster service',
      'Speak clearly and provide accurate information',
      'Note down the reference number provided by our agent',
      'Follow up within 3 business days if your issue is not resolved',
    ],
    donts: [
      'Do not call multiple times for the same issue within 24 hours',
      'Avoid providing false or misleading information',
      'Do not use abusive language with our staff',
      'Never share your password or sensitive banking details over the phone',
      'Do not call outside office hours unless it\'s an emergency',
    ],
  },
  {
    category: 'Student Registration',
    dos: [
      'Complete registration before the deadline (August 31st)',
      'Provide original documents for verification',
      'Update your contact information if it changes',
      'Keep copies of all submitted documents',
      'Verify registration confirmation via SMS or email',
    ],
    donts: [
      'Do not submit photocopies without originals for verification',
      'Avoid registering multiple times for the same student',
      'Do not provide documents belonging to another person',
      'Never pay registration fees to unauthorized persons',
      'Do not ignore registration confirmation messages',
    ],
  },
  {
    category: 'Fee Payments',
    dos: [
      'Use official payment channels (mobile money, bank transfer, or cash at centers)',
      'Keep payment receipts for at least 1 year',
      'Verify payment confirmation before leaving the payment center',
      'Request a refund within 30 days if you made an error',
      'Pay in installments if you qualify for the payment plan',
    ],
    donts: [
      'Do not pay fees to individuals claiming to represent the ministry',
      'Avoid making payments to unverified mobile money numbers',
      'Never share your payment PIN or OTP with anyone',
      'Do not ignore payment reminders - late fees may apply',
      'Do not expect refunds for completed transactions after 30 days',
    ],
  },
  {
    category: 'Using Online Portals',
    dos: [
      'Use a secure internet connection when accessing portals',
      'Log out after completing your session',
      'Change your password regularly (every 3 months)',
      'Enable two-factor authentication if available',
      'Report suspicious activity immediately',
    ],
    donts: [
      'Do not share your login credentials with anyone',
      'Avoid using public computers for sensitive transactions',
      'Never click on suspicious links in emails claiming to be from us',
      'Do not use simple passwords like "123456" or "password"',
      'Avoid saving passwords in shared browsers',
    ],
  },
];

export default function DosDontsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Ministry of Education</h1>
              <p className="text-xs text-gray-500">Do's & Don'ts</p>
            </div>
          </Link>
          <Link href="/landing">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Do's & Don'ts</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Essential guidelines for schools, parents, and students to ensure smooth
            interactions with our services.
          </p>
        </div>
      </section>

      {/* Guidelines */}
      <section className="container mx-auto px-6 py-16 max-w-6xl">
        {guidelines.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Do's */}
              <Card className="border-2 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700">Do's</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.dos.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Don'ts */}
              <Card className="border-2 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-red-700">Don'ts</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.donts.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {/* Download CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Need a Printable Copy?</h3>
            <p className="text-blue-100 mb-6">
              Download our comprehensive Do's & Don'ts guide as a PDF for your school or office.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Download PDF Guide
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Ministry of Education, Sierra Leone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

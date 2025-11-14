'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    category: 'Registration',
    questions: [
      {
        question: 'How do I register my child for the new academic year?',
        answer:
          'Registration can be done online through our portal at education.gov.sl/register or in-person at your district education office. You will need your child\'s birth certificate, proof of residence, and two passport photos.',
      },
      {
        question: 'What is the deadline for student registration?',
        answer:
          'Registration typically opens in June and closes on August 31st each year. Late registrations may be accepted on a case-by-case basis with valid reasons.',
      },
    ],
  },
  {
    category: 'Fees & Payments',
    questions: [
      {
        question: 'What payment methods are accepted for school fees?',
        answer:
          'We accept mobile money (Orange Money, Africell Money), bank transfers, and direct cash payments at designated collection centers. Online payments can be made through our secure portal.',
      },
      {
        question: 'Can I pay school fees in installments?',
        answer:
          'Yes, installment payment plans are available. Contact your school administration or call our helpline to set up a payment schedule that works for your family.',
      },
    ],
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'I forgot my portal password. How do I reset it?',
        answer:
          'Click on "Forgot Password" on the login page and enter your registered email or phone number. You will receive a password reset link within 5 minutes.',
      },
      {
        question: 'The online portal is not loading. What should I do?',
        answer:
          'Try clearing your browser cache, using a different browser, or checking your internet connection. If the problem persists, call our technical support hotline at +232 76 000 000.',
      },
    ],
  },
  {
    category: 'General Inquiries',
    questions: [
      {
        question: 'What are your call center operating hours?',
        answer:
          'Our call center operates Monday to Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays.',
      },
      {
        question: 'How can I provide feedback about my call experience?',
        answer:
          'After each call, you will receive an SMS with a feedback link. You can also email feedback@education.gov.sl or fill out our online feedback form on our website.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

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
              <p className="text-xs text-gray-500">Frequently Asked Questions</p>
            </div>
          </Link>
          <Link href="/landing">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Find quick answers to common questions about registration, fees, and our
            services.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">{categoryIndex + 1}</span>
              </div>
              {category.category}
            </h2>
            <div className="space-y-3">
              {category.questions.map((item, questionIndex) => {
                const key = `${categoryIndex}-${questionIndex}`;
                const isOpen = openIndex === key;
                return (
                  <Card key={questionIndex} className="overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                      className="w-full text-left"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 text-lg pr-4">
                            {item.question}
                          </h3>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        {isOpen && (
                          <p className="mt-4 text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        )}
                      </CardContent>
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any additional questions.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg">Call Us: +232 76 000 000</Button>
              <Button size="lg" variant="outline">
                Email Support
              </Button>
            </div>
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

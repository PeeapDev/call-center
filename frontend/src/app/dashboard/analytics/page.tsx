'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Clock,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

// Mock AI-generated analytics
const mockAnalytics = {
  transcriptionRate: 85,
  avgSentimentScore: 7.8,
  commonIssues: [
    { issue: 'Student Registration', count: 23, trend: 'up' },
    { issue: 'Fee Payment', count: 18, trend: 'down' },
    { issue: 'Course Enrollment', count: 15, trend: 'stable' },
    { issue: 'Technical Support', count: 12, trend: 'up' },
  ],
  recentInsights: [
    {
      id: '1',
      callId: 'CALL-001',
      date: '2025-11-14',
      time: '10:23 AM',
      caller: '+232 76 123 456',
      agent: 'Sarah Johnson',
      duration: '4:32',
      sentiment: 'positive',
      summary:
        'Student inquired about registration process for the new semester. Agent provided clear instructions and email confirmation. High satisfaction noted.',
      keywords: ['registration', 'semester', 'documentation'],
      aiScore: 9.2,
    },
    {
      id: '2',
      callId: 'CALL-002',
      date: '2025-11-14',
      time: '10:18 AM',
      caller: '+232 77 987 654',
      agent: 'Michael Chen',
      duration: '6:45',
      sentiment: 'neutral',
      summary:
        'Parent concerned about tuition payment deadline. Agent explained extension policy and provided payment portal link. Issue resolved.',
      keywords: ['tuition', 'payment', 'deadline'],
      aiScore: 7.5,
    },
    {
      id: '3',
      callId: 'CALL-003',
      date: '2025-11-14',
      time: '10:05 AM',
      caller: '+232 78 555 123',
      agent: 'Emily Rodriguez',
      duration: '3:12',
      sentiment: 'negative',
      summary:
        'Student frustrated with course enrollment system errors. Agent escalated to technical team. Follow-up scheduled.',
      keywords: ['enrollment', 'technical issue', 'system error'],
      aiScore: 4.2,
    },
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI-Powered Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Insights from call transcriptions and sentiment analysis
          </p>
        </div>
        <Button>
          <Brain className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transcription Rate
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalytics.transcriptionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Calls auto-transcribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockAnalytics.avgSentimentScore}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalytics.commonIssues.length}
            </div>
            <p className="text-xs text-muted-foreground">Categories identified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Active</div>
            <p className="text-xs text-muted-foreground">Whisper + Azure AI</p>
          </CardContent>
        </Card>
      </div>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalytics.commonIssues.map((issue, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{issue.issue}</p>
                    <p className="text-sm text-gray-500">{issue.count} calls</p>
                  </div>
                </div>
                <Badge
                  variant={
                    issue.trend === 'up'
                      ? 'destructive'
                      : issue.trend === 'down'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  <TrendingUp
                    className={`w-3 h-3 mr-1 ${issue.trend === 'down' ? 'rotate-180' : ''}`}
                  />
                  {issue.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Call Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.recentInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-6 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {insight.callId}
                      </h3>
                      <Badge
                        variant={
                          insight.sentiment === 'positive'
                            ? 'default'
                            : insight.sentiment === 'negative'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={
                          insight.sentiment === 'positive' ? 'bg-green-500' : ''
                        }
                      >
                        {insight.sentiment}
                      </Badge>
                      <Badge variant="outline">AI Score: {insight.aiScore}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {insight.caller} → {insight.agent} • {insight.date} at{' '}
                      {insight.time} ({insight.duration})
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{insight.summary}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">
                    Keywords:
                  </span>
                  {insight.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Transcript
                  </Button>
                  <Button variant="outline" size="sm">
                    Listen to Recording
                  </Button>
                  <Button variant="outline" size="sm">
                    Full AI Analysis
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Notice */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">
                🚀 AI Transcription & Analysis
              </h3>
              <p className="text-sm text-purple-800 mb-3">
                This dashboard shows mock AI-generated insights. To enable real
                transcription:
              </p>
              <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                <li>Configure Whisper/WhisperX for speech-to-text</li>
                <li>Connect Azure OpenAI or Llama 3.1 for analysis</li>
                <li>Set up background processing pipeline</li>
                <li>Enable sentiment analysis and keyword extraction</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Mic, Users, Clock, Target, ArrowLeft } from "lucide-react";
import Link from "next/link";

import Agent from "@/components/Agent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="px-6 lg:px-8 pt-8 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="mb-4 flex justify-center">
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                <Mic className="mr-1 h-4 w-4" />
                AI Interview Session
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Start Your Interview
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with our AI interviewer for personalized practice sessions. 
              Get real-time feedback and improve your interview skills.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Users,
                title: "AI Interviewer",
                description: "Powered by advanced AI",
                color: "blue"
              },
              {
                icon: Clock,
                title: "Real-time",
                description: "Instant feedback & analysis",
                color: "green"
              },
              {
                icon: Target,
                title: "Personalized",
                description: "Tailored to your role",
                color: "purple"
              }
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardContent className="pt-6">
                  <item.icon className={`h-8 w-8 mx-auto mb-3 ${
                    item.color === 'blue' ? 'text-blue-600' :
                    item.color === 'green' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                  <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Interview Interface Section */}
      <div className="px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Interview Session
              </CardTitle>
              <CardDescription className="text-lg">
                Click the call button below to start your AI-powered interview practice
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {/* Interview Agent Component */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
                <Agent
                  userName={user?.name!}
                  userId={user?.id}
                  type="generate"
                />
              </div>
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card className="mt-8 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Start the Call</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Click the call button to connect with the AI interviewer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Answer Questions</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Respond naturally to interview questions asked by the AI</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Get Feedback</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive detailed analysis and improvement suggestions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Practice More</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Continue practicing to improve your interview skills</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
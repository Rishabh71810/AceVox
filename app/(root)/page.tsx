import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Star, Users, Zap, Target, Calendar, Clock, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.actions";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews && userInterviews.length > 0;
  
  // Add console log for debugging
  console.log('User interviews:', userInterviews);
  console.log('Has past interviews:', hasPastInterviews);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-20 pb-32">
        <div className="mx-auto max-w-7xl">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
              <Zap className="mr-1 h-4 w-4" />
              AI-Powered Interview Practice
            </Badge>
          </div>

          {/* Main Hero Content */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Master Your Next
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Interview</span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get interview-ready with AI-powered practice sessions. Receive instant feedback, 
              improve your skills, and land your dream job with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
                <Link href="/interview">
                  Start Interview Practice
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800" />
                  ))}
                </div>
                <span>500+ interviews completed</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-300 to-indigo-300 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Your Interviews Section - Moved up as main feature */}
      <section className="py-24 px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Your Interview Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Track your progress and manage your interview sessions
            </p>
          </div>

          {/* Your Interviews Section */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">Your Interviews</h3>
                {hasPastInterviews && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {userInterviews.length} completed
                  </Badge>
                )}
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-full w-full sm:w-auto">
                <Link href="/interview">
                  <Zap className="mr-2 h-4 w-4" />
                  Take New Interview
                </Link>
              </Button>
            </div>
            
            {hasPastInterviews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {userInterviews.slice(0, 6).map((interview, index) => (
                  <Card key={interview.id || index} className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Cover Image */}
                    {interview.coverImage && (
                      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-2 left-4 right-4">
                          <Badge variant="secondary" className="bg-white/90 text-gray-800 backdrop-blur-sm">
                            {interview.type || 'Practice'}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {interview.role || 'Software Developer'}
                          </CardTitle>
                          <CardDescription className="flex items-center text-sm mt-1">
                            <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          <Calendar className="mr-1 h-3 w-3" />
                          {interview.level || 'Mid-level'}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 pb-4">
                      <div className="space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={interview.completed ? "default" : "secondary"} 
                            className={interview.completed 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }
                          >
                            {interview.completed ? 'Completed' : 'In Progress'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {interview.questions?.length || 5} questions
                          </span>
                        </div>
                        
                        {/* Tech Stack */}
                        {interview.techstack && interview.techstack.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Technologies:</span>
                            <div className="flex flex-wrap gap-1">
                              {interview.techstack.slice(0, 4).map((tech, techIndex) => (
                                <Badge 
                                  key={techIndex} 
                                  variant="outline" 
                                  className="text-xs px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                                >
                                  {tech === 'you' ? 'General' : tech}
                                </Badge>
                              ))}
                              {interview.techstack.length > 4 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  +{interview.techstack.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 text-xs"
                            asChild
                          >
                            <Link href={`/interview/${interview.id}/feedback`}>
                              <TrendingUp className="mr-1 h-3 w-3" />
                              View Results
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 text-xs"
                            asChild
                          >
                            <Link href="/interview">
                              Retry
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 text-center py-12 lg:py-16">
                <CardContent className="px-6 lg:px-8">
                  <div className="text-gray-400 mb-6">
                    <Target className="h-16 lg:h-20 w-16 lg:w-20 mx-auto" />
                  </div>
                  <CardTitle className="text-xl lg:text-2xl mb-4">Ready to start your interview journey?</CardTitle>
                  <CardDescription className="text-base lg:text-lg mb-6 lg:mb-8 max-w-md mx-auto">
                    Take your first AI-powered interview practice session and get personalized feedback to improve your skills.
                  </CardDescription>
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 lg:px-8 py-3 lg:py-4">
                    <Link href="/interview">
                      <Zap className="mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                      Start Your First Interview
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {hasPastInterviews && (
              <div className="text-center">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/interviews">
                    View All Interviews ({userInterviews.length})
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[
              { 
                label: "Interviews Completed", 
                value: userInterviews?.length || 0,
                icon: CheckCircle,
                color: "blue"
              },
              { 
                label: "Success Rate", 
                value: userInterviews?.length ? "85%" : "0%",
                icon: TrendingUp,
                color: "green"
              },
              { 
                label: "Skills Practiced", 
                value: userInterviews?.length ? Math.min(userInterviews.length * 3, 25) : 0,
                icon: Target,
                color: "purple"
              }
            ].map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-xl transition-all duration-200 hover:scale-105">
                <CardContent className="pt-6 pb-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to ace your interview
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Comprehensive interview preparation tools powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "AI-Powered Questions",
                description: "Get personalized interview questions based on your role and industry"
              },
              {
                icon: Users,
                title: "Real-time Feedback",
                description: "Instant analysis of your responses with actionable improvement tips"
              },
              {
                icon: Zap,
                title: "Practice Sessions",
                description: "Unlimited practice with various interview formats and difficulty levels"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
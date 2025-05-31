import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { 
  Star, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Home,
  Target,
  User,
  Clock,
  Award,
  BarChart3
} from "lucide-react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to get score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interview Feedback
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            <span className="capitalize font-semibold">{interview.role}</span> Position Assessment
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full ${getScoreBg(feedback?.totalScore || 0)}`}>
                <Award className={`h-12 w-12 ${getScoreColor(feedback?.totalScore || 0)}`} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              Overall Score: <span className={getScoreColor(feedback?.totalScore || 0)}>
                {feedback?.totalScore || 0}
              </span>/100
            </CardTitle>
            <CardDescription className="text-lg">
              {feedback?.totalScore && feedback.totalScore >= 80 
                ? "Excellent performance! You're well-prepared for this role."
                : feedback?.totalScore && feedback.totalScore >= 60
                ? "Good performance with room for improvement."
                : "Keep practicing! Focus on the areas for improvement below."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Position</p>
                  <p className="text-gray-600 dark:text-gray-300 capitalize">{interview.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Completed</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feedback?.createdAt
                      ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Assessment */}
        {feedback?.finalAssessment && (
          <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Overall Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {feedback.finalAssessment}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Detailed Breakdown</span>
            </CardTitle>
            <CardDescription>
              Performance analysis across different interview categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {feedback?.categoryScores?.map((category, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <Badge variant="outline" className={`${getScoreBg(category.score)} ${getScoreColor(category.score)} border-0`}>
                      {category.score}/100
                    </Badge>
                  </div>
                  <Progress value={category.score} className="h-3" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {category.comment}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Areas for Improvement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Strengths</span>
              </CardTitle>
              <CardDescription>
                Areas where you performed exceptionally well
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback?.strengths?.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Areas for Improvement</span>
              </CardTitle>
              <CardDescription>
                Focus areas for your next practice session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback?.areasForImprovement?.map((area, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{area}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 max-w-xs rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            asChild
          >
            <Link href="/" className="flex items-center justify-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>

          <Button 
            size="lg" 
            className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 rounded-full"
            asChild
          >
            <Link href="/interview" className="flex items-center justify-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Practice Again</span>
            </Link>
          </Button>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              <span>Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Practice More</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Take more practice interviews to improve your weaker areas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Star className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Review Feedback</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Study the detailed feedback to understand improvement areas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
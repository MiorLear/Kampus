// src/components/Home.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BookOpen, Users, Award, TrendingUp, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/auth";

type Role = "student" | "teacher" | "admin";
const rolePath = (role?: Role | null) => `/dashboard/${role ?? "student"}`;

export function Home() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(rolePath(role ?? "student"));
  };

  const handleLogout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Learning",
      description:
        "Access thousands of courses across various disciplines with expert instructors.",
    },
    {
      icon: Users,
      title: "Interactive Community",
      description:
        "Connect with fellow students and teachers in a collaborative learning environment.",
    },
    {
      icon: Award,
      title: "Certified Programs",
      description:
        "Earn recognized certificates upon completion of courses and programs.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed analytics and progress reports.",
    },
  ];

  const stats = [
    { label: "Active Students", value: "10,000+" },
    { label: "Expert Instructors", value: "500+" },
    { label: "Available Courses", value: "2,000+" },
    { label: "Success Rate", value: "95%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">Kampus</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your gateway to world-class education. Join thousands of learners in our
              comprehensive Learning Management System designed for students, teachers,
              and administrators.
            </p>

            {/* BOTONES HERO */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8"
                    onClick={handleGoToDashboard}
                    disabled={loading}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>

                  <Button
                    size="lg"
                    variant="destructive"
                    className="text-lg px-8"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Kampus?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience education like never before with our cutting-edge platform
              designed for modern learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Designed for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a student, teacher, or administrator, Kampus provides the
              tools you need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">For Students</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Learn & Grow
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Access courses, track progress, submit assignments, and connect with
                  peers in a collaborative environment.
                </CardDescription>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Interactive course materials</li>
                  <li>• Progress tracking</li>
                  <li>• Peer collaboration</li>
                  <li>• Mobile learning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">For Teachers</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Teach & Inspire
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Create engaging courses, manage students, track performance, and build
                  a thriving learning community.
                </CardDescription>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Course creation tools</li>
                  <li>• Student management</li>
                  <li>• Analytics dashboard</li>
                  <li>• Assessment tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">For Administrators</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Manage & Oversee
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Oversee the entire platform, manage users, analyze performance, and
                  ensure smooth operations.
                </CardDescription>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• User management</li>
                  <li>• System analytics</li>
                  <li>• Content moderation</li>
                  <li>• Platform settings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {user
              ? `Welcome back, ${user.displayName || "User"}!`
              : "Ready to Start Your Learning Journey?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {user
              ? `Continue your learning journey with your ${role ?? "student"} dashboard.`
              : "Join thousands of learners who are already using Kampus to achieve their educational goals."}
          </p>

          {/* Si hay sesión, botón acciona handler. Si no, enlace a /auth */}
          {user ? (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={handleGoToDashboard}
              disabled={loading}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link to="/auth">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

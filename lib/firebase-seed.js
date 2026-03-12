/**
 * Firebase Data Seeding Script
 *
 * This script populates your Firebase Firestore with sample courses and data
 * for testing and demonstration purposes.
 *
 * Run this script once after setting up Firebase to create initial data.
 */

import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Sample courses data
const sampleCourses = [
  {
    id: "course-1",
    title: "Introduction to SMRI",
    description:
      "Learn the basics of SMRI and how to navigate the platform effectively.",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    category: "Getting Started",
    level: "Beginner",
    duration: "2 hours",
    modules: [
      {
        id: "m1",
        title: "Module 1: Getting Started",
        description: "Introduction to the platform and basic navigation",
        lessons: [
          {
            id: "l1",
            title: "Welcome to the Course",
            introduction:
              "Welcome to the Introduction to SMRI course. Get ready to learn!",
            content: `
              <h2>Welcome to SMRI Learning Platform</h2>
              <p>This is the first lesson in your journey with SMRI. In this course, you'll learn:</p>
              <ul>
                <li>How to navigate the dashboard</li>
                <li>How to track your progress</li>
                <li>How to access course materials</li>
                <li>How to complete lessons and modules</li>
              </ul>
              <p>Let's get started on this exciting learning journey!</p>
            `,
            videoUrl: null,
            duration: "10 min",
            order: 1,
          },
          {
            id: "l2",
            title: "Navigating the Dashboard",
            introduction:
              "Learn how to find your way around the SMRI dashboard.",
            content: `
              <h2>Dashboard Navigation</h2>
              <p>The SMRI dashboard is your central hub for all learning activities. Here's what you'll find:</p>
              <h3>Sidebar Menu</h3>
              <ul>
                <li><strong>My Courses:</strong> View all your enrolled courses and track progress</li>
                <li><strong>Settings:</strong> Manage your profile and preferences</li>
              </ul>
              <h3>Course Filters</h3>
              <p>Use the tabs to filter courses by status:</p>
              <ul>
                <li>All Courses</li>
                <li>In Progress</li>
                <li>Completed</li>
              </ul>
            `,
            videoUrl: null,
            duration: "15 min",
            order: 2,
          },
          {
            id: "l3",
            title: "Understanding Course Structure",
            introduction:
              "Learn about modules, lessons, and how courses are organized.",
            content: `
              <h2>Course Structure</h2>
              <p>Each course in SMRI is organized into modules and lessons:</p>
              <h3>Modules</h3>
              <p>Modules are major sections of a course that group related lessons together. Think of them as chapters in a book.</p>
              <h3>Lessons</h3>
              <p>Lessons are individual learning units within a module. Each lesson covers a specific topic or skill.</p>
              <h3>Progress Tracking</h3>
              <p>Your progress is automatically tracked as you complete lessons. You'll see your completion percentage on both the course card and course detail page.</p>
            `,
            videoUrl: null,
            duration: "12 min",
            order: 3,
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Advanced Features",
        description: "Explore advanced platform features and capabilities",
        lessons: [
          {
            id: "l4",
            title: "Deep Dive into Features",
            introduction: "Exploring advanced features that make SMRI unique.",
            content: `
              <h2>Advanced Platform Features</h2>
              <p>Now that you're familiar with the basics, let's explore some advanced features:</p>
              <h3>Progress Tracking</h3>
              <p>SMRI automatically tracks your progress through each course. You can see:</p>
              <ul>
                <li>Overall course completion percentage</li>
                <li>Which lessons you've completed</li>
                <li>Your learning streak</li>
              </ul>
              <h3>Personalized Learning Path</h3>
              <p>Based on your progress and interests, SMRI recommends courses that match your learning goals.</p>
            `,
            videoUrl: null,
            duration: "20 min",
            order: 1,
          },
          {
            id: "l5",
            title: "Tips for Success",
            introduction:
              "Best practices for getting the most out of your learning experience.",
            content: `
              <h2>Tips for Successful Learning</h2>
              <p>Here are some proven strategies to maximize your learning on SMRI:</p>
              <h3>1. Set a Regular Schedule</h3>
              <p>Consistency is key. Try to dedicate specific times each week to your courses.</p>
              <h3>2. Take Notes</h3>
              <p>While watching lessons, jot down key points and insights.</p>
              <h3>3. Practice What You Learn</h3>
              <p>Apply concepts immediately to reinforce your understanding.</p>
              <h3>4. Complete Lessons in Order</h3>
              <p>Courses are designed to build on previous knowledge, so follow the sequence.</p>
            `,
            videoUrl: null,
            duration: "15 min",
            order: 2,
          },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "Advanced Learning Strategies",
    description:
      "Master advanced techniques for effective online learning and knowledge retention.",
    thumbnail:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    category: "Study Skills",
    level: "Intermediate",
    duration: "3 hours",
    modules: [
      {
        id: "m1",
        title: "Module 1: Memory Techniques",
        description: "Learn proven methods to improve memory and retention",
        lessons: [
          {
            id: "l1",
            title: "Introduction to Memory Techniques",
            introduction:
              "Discover how memory works and techniques to enhance it.",
            content: `
              <h2>Understanding Memory</h2>
              <p>Memory is a complex process that involves encoding, storing, and retrieving information. In this lesson, you'll learn:</p>
              <ul>
                <li>The three types of memory: sensory, short-term, and long-term</li>
                <li>How information moves from short-term to long-term memory</li>
                <li>Factors that affect memory retention</li>
              </ul>
              <h3>The Spacing Effect</h3>
              <p>Research shows that spacing out your learning over time leads to better retention than cramming.</p>
            `,
            videoUrl: null,
            duration: "25 min",
            order: 1,
          },
          {
            id: "l2",
            title: "Active Recall and Spaced Repetition",
            introduction: "Two powerful techniques for long-term learning.",
            content: `
              <h2>Active Recall</h2>
              <p>Active recall involves actively retrieving information from memory rather than passively reviewing it.</p>
              <h3>How to Practice Active Recall:</h3>
              <ol>
                <li>After learning something, close your notes</li>
                <li>Try to recall the main points from memory</li>
                <li>Check your accuracy and fill in gaps</li>
              </ol>
              <h2>Spaced Repetition</h2>
              <p>Review material at increasing intervals to move it into long-term memory.</p>
            `,
            videoUrl: null,
            duration: "30 min",
            order: 2,
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Note-Taking Strategies",
        description:
          "Effective methods for capturing and organizing information",
        lessons: [
          {
            id: "l3",
            title: "The Cornell Method",
            introduction: "A systematic format for organizing notes.",
            content: `
              <h2>Cornell Note-Taking System</h2>
              <p>The Cornell Method divides your page into three sections:</p>
              <h3>1. Notes Column (Right Side)</h3>
              <p>Record main ideas and details during the lesson.</p>
              <h3>2. Cue Column (Left Side)</h3>
              <p>After class, write questions or keywords that relate to your notes.</p>
              <h3>3. Summary Section (Bottom)</h3>
              <p>Summarize the main points in your own words.</p>
            `,
            videoUrl: null,
            duration: "20 min",
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: "course-3",
    title: "Digital Literacy Fundamentals",
    description:
      "Essential skills for navigating the digital world safely and effectively.",
    thumbnail:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    category: "Technology",
    level: "Beginner",
    duration: "2.5 hours",
    modules: [
      {
        id: "m1",
        title: "Module 1: Internet Basics",
        description: "Understanding how the internet works",
        lessons: [
          {
            id: "l1",
            title: "What is the Internet?",
            introduction: "Learn the fundamentals of internet technology.",
            content: `
              <h2>The Internet Explained</h2>
              <p>The internet is a global network of interconnected computers that communicate using standardized protocols.</p>
              <h3>Key Concepts:</h3>
              <ul>
                <li><strong>Web Browsers:</strong> Software that displays web pages</li>
                <li><strong>URLs:</strong> Web addresses that locate resources</li>
                <li><strong>Search Engines:</strong> Tools for finding information</li>
              </ul>
            `,
            videoUrl: null,
            duration: "18 min",
            order: 1,
          },
          {
            id: "l2",
            title: "Online Safety and Privacy",
            introduction: "Protect yourself while browsing the internet.",
            content: `
              <h2>Staying Safe Online</h2>
              <p>Online safety is crucial in today's digital world. Here are essential practices:</p>
              <h3>Password Security</h3>
              <ul>
                <li>Use strong, unique passwords for each account</li>
                <li>Enable two-factor authentication</li>
                <li>Never share passwords</li>
              </ul>
              <h3>Privacy Protection</h3>
              <ul>
                <li>Be cautious about sharing personal information</li>
                <li>Review privacy settings on social media</li>
                <li>Use secure connections (HTTPS)</li>
              </ul>
            `,
            videoUrl: null,
            duration: "22 min",
            order: 2,
          },
        ],
      },
    ],
  },
];

/**
 * Seed courses into Firestore
 */
export const seedCourses = async () => {
  try {
    for (const course of sampleCourses) {
      const courseRef = doc(db, "courses", course.id);
      await setDoc(courseRef, {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, count: sampleCourses.length };
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    throw error;
  }
};

/**
 * Create a sample user profile
 */
export const createSampleUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName || "Student User",
      role: "student",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error creating user profile:", error);
    throw error;
  }
};

/**
 * Enroll sample user in all courses
 */
export const enrollSampleUserInCourses = async (userId) => {
  try {
    for (const course of sampleCourses) {
      const enrollmentRef = doc(collection(db, "userCourses"));
      await setDoc(enrollmentRef, {
        userId,
        courseId: course.id,
        progress: course.id === "course-1" ? 35 : 0,
        status: course.id === "course-1" ? "in-progress" : "not-started",
        completedLessons: course.id === "course-1" ? ["l1"] : [],
        enrolledAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};

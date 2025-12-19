"use client";

import { useState, useContext, useEffect } from "react"; // Added useContext, useEffect
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AuthContext } from "@/context/AuthContext"; // Import AuthContext
import {
  Upload,
  Loader2,
  X,
  Plus,
  MoreHorizontal,
  Bold,
  Italic,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Paperclip,
  Trash2,
  Edit2,
  Music,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  uploadCourseThumbnail,
  uploadLessonVideo,
  uploadLessonImage,
  validateImage,
  validateVideo,
} from "@/lib/s3-upload";
import { createCourse, getCourseById, updateCourse } from "@/lib/firebase-db";
import CoursePublishedSuccess from "@/components/dashboard/CoursePublishedSuccess";
import TipTapEditor from "@/components/dashboard/TipTapEditor";
// Removed: import { getCurrentUser } from '@/lib/firebase-auth';

export default function CreateCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { user, loading: authLoading } = useContext(AuthContext); // Use AuthContext

  const [activeTab, setActiveTab] = useState("information");
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [error, setError] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'video', 'image', 'audio', 'document'
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [courseData, setCourseData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    thumbnailUrl: "",
  });

  const [modules, setModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  // Redirect if not authenticated (optional, but good practice)
  // Auth redirect handled by DashboardLayout
  // Load course data if editing
  useEffect(() => {
    if (courseId) {
      setLoading(true);
      getCourseById(courseId)
        .then((course) => {
          setCourseData({
            title: course.title || "",
            shortDescription: course.description || "",
            fullDescription: course.fullDescription || "",
            thumbnailUrl: course.thumbnail || "",
          });

          // Ensure modules structure is compatible for editing
          if (course.modules) {
            setModules(
              course.modules.map((m) => ({
                ...m,
                id: Number(m.id) || Date.now() + Math.random(),
                lessons: (m.lessons || []).map((l) => ({
                  ...l,
                  id: Number(l.id) || Date.now() + Math.random(),
                })),
              }))
            );
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load course");
          setLoading(false);
        });
    }
  }, [courseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file, 5);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  // Module Management
  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: `Module ${modules.length + 1}: New Module`,
      lessons: [],
      isEditing: true,
    };
    setModules([...modules, newModule]);
    setEditingModule(newModule.id);
  };

  const updateModuleTitle = (moduleId, title) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, title } : m)));
  };

  const deleteModule = (moduleId) => {
    if (
      confirm(
        "Are you sure you want to delete this module and all its lessons?"
      )
    ) {
      setModules(modules.filter((m) => m.id !== moduleId));
      if (selectedLesson?.moduleId === moduleId) {
        setSelectedLesson(null);
      }
    }
  };

  const toggleEditModule = (moduleId) => {
    setEditingModule(editingModule === moduleId ? null : moduleId);
  };

  // Lesson Management
  const addLesson = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    const newLesson = {
      id: Date.now(),
      title: `Lesson ${module.lessons.length + 1}: New Lesson`,
      content: "",
      isEditing: true,
    };

    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: [...m.lessons, newLesson],
          };
        }
        return m;
      })
    );

    setSelectedLesson({ moduleId, lessonId: newLesson.id });
    setEditingLesson(newLesson.id);
  };

  const updateLessonTitle = (moduleId, lessonId, title) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, title } : l
            ),
          };
        }
        return m;
      })
    );
  };

  const deleteLesson = (moduleId, lessonId) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      setModules(
        modules.map((m) => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: m.lessons.filter((l) => l.id !== lessonId),
            };
          }
          return m;
        })
      );

      if (selectedLesson?.lessonId === lessonId) {
        setSelectedLesson(null);
      }
    }
  };

  const toggleEditLesson = (lessonId) => {
    setEditingLesson(editingLesson === lessonId ? null : lessonId);
  };

  const updateLessonContent = (content) => {
    if (!selectedLesson) return;

    setModules(
      modules.map((m) => {
        if (m.id === selectedLesson.moduleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === selectedLesson.lessonId) {
                return { ...l, content };
              }
              return l;
            }),
          };
        }
        return m;
      })
    );
  };

  const getCurrentLessonContent = () => {
    if (!selectedLesson) return "";
    const module = modules.find((m) => m.id === selectedLesson.moduleId);
    const lesson = module?.lessons.find(
      (l) => l.id === selectedLesson.lessonId
    );
    return lesson?.content || "";
  };

  // Media Upload Functions
  const openMediaModal = (type) => {
    setMediaType(type);
    setShowMediaModal(true);
  };

  const handleMediaUpload = async (file) => {
    setUploadingMedia(true);
    setError("");

    try {
      let uploadResult;

      if (mediaType === "image") {
        const validation = validateImage(file, 10);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        uploadResult = await uploadLessonImage(file);
      } else if (mediaType === "video") {
        const validation = validateVideo(file, 200);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        uploadResult = await uploadLessonVideo(file);
      } else {
        // For audio and documents, use the same upload as images for now
        uploadResult = await uploadLessonImage(file);
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Insert media into lesson content
      insertMediaIntoContent(uploadResult.url, mediaType);
      setShowMediaModal(false);
      setUploadingMedia(false);
    } catch (err) {
      setError(err.message);
      setUploadingMedia(false);
    }
  };

  const insertMediaIntoContent = (url, type) => {
    const currentContent = getCurrentLessonContent();
    let mediaMarkup = "";

    switch (type) {
      case "image":
        mediaMarkup = `<img src="${url}" alt="Image" />`;
        break;
      case "video":
        mediaMarkup = `<video src="${url}" controls class="w-full h-auto rounded-lg shadow-md aspect-video my-4"></video>`;
        break;
      case "audio":
        mediaMarkup = `<p><a href="${url}" target="_blank" class="text-cyan-600">[AUDIO] Listen to Audio</a></p>`;
        break;
      case "document":
        mediaMarkup = `<p><a href="${url}" target="_blank" class="text-cyan-600">[DOCUMENT] Download Document</a></p>`;
        break;
      default:
        mediaMarkup = `<p><a href="${url}" target="_blank" class="text-cyan-600">${url}</a></p>`;
    }

    updateLessonContent(currentContent + mediaMarkup);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      const text = prompt("Enter link text:");
      const linkMarkup = `[${text || url}](${url})`;
      updateLessonContent(getCurrentLessonContent() + " " + linkMarkup);
    }
  };

  const handleSaveDraft = async () => {
    setError("");
    setLoading(true);

    try {
      // Minimal validation for Drafts
      if (!courseData.title.trim()) {
        throw new Error("Course title is required to save a draft");
      }

      // Use user from context
      if (!user) {
        throw new Error("You must be signed in to save a draft");
      }

      // Handle Thumbnail Upload if strictly necessary or provided
      let thumbnailUrl = courseData.thumbnailUrl;
      if (thumbnailFile) {
        const uploadResult = await uploadCourseThumbnail(thumbnailFile);
        if (!uploadResult.success) {
          throw new Error("Failed to upload thumbnail: " + uploadResult.error);
        }
        thumbnailUrl = uploadResult.url;
      }

      const course = {
        title: courseData.title,
        description: courseData.shortDescription || "",
        fullDescription: courseData.fullDescription || "",
        thumbnail: thumbnailUrl || "",
        status: "draft", // Explicitly marking as draft
        modules: modules.map((m, idx) => ({
          id: m.id.toString(),
          title: m.title,
          order: idx + 1,
          lessons: m.lessons.map((l, lIdx) => ({
            id: l.id.toString(),
            title: l.title,
            content: l.content || "",
            order: lIdx + 1,
          })),
        })),
        createdBy: user.id || user.uid || "mock-user-id", // Handle Mock/Firebase hybrid
        createdByEmail: user.email,
      };

      if (courseId) {
        await updateCourse(courseId, course);
      } else {
        await createCourse(course);
      }

      // UX: Navigate back to dashboard with success (or just alert for now)
      // router.push('/dashboard?message=draft-saved');
      alert("Course saved as draft! You can continue editing it later.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setError("");
    setLoading(true);
    try {
      // STRICT Validation for Publishing
      if (!courseData.title.trim()) throw new Error("Course title is required");
      if (!courseData.shortDescription.trim())
        throw new Error("Short description is required");
      if (!courseData.fullDescription.trim())
        throw new Error("Full description is required");

      if (!thumbnailFile && !courseData.thumbnailUrl) {
        throw new Error("Course thumbnail is required");
      }

      if (modules.length === 0) {
        throw new Error("Please add at least one module");
      }

      // Ensure every module has at least one lesson and lessons have content?
      // User requested "all details are provided".
      const emptyModule = modules.find((m) => m.lessons.length === 0);
      if (emptyModule) {
        throw new Error(
          `Module "${emptyModule.title}" has no lessons. Please add lessons or remove the module.`
        );
      }

      // Use user from context
      if (!user) {
        throw new Error("You must be signed in");
      }

      let thumbnailUrl = courseData.thumbnailUrl;
      if (thumbnailFile) {
        const uploadResult = await uploadCourseThumbnail(thumbnailFile);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
        thumbnailUrl = uploadResult.url;
      }

      const course = {
        title: courseData.title,
        description: courseData.shortDescription,
        fullDescription: courseData.fullDescription,
        thumbnail: thumbnailUrl,
        status: "published", // Explicitly marking as published
        modules: modules.map((m, idx) => ({
          id: m.id.toString(),
          title: m.title,
          order: idx + 1,
          lessons: m.lessons.map((l, lIdx) => ({
            id: l.id.toString(),
            title: l.title,
            content: l.content,
            order: lIdx + 1,
          })),
        })),
        createdBy: user.id || user.uid || "mock-user-id",
        createdByEmail: user.email,
        publishedAt: new Date().toISOString(), // Add published timestamp
      };

      if (courseId) {
        await updateCourse(courseId, course);
      } else {
        await createCourse(course);
      }
      setLoading(false); // Stop loading before showing success
      setShowSuccess(true);
      // router.push('/dashboard'); // Moved to CoursePublishedSuccess onBackToCourses
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <CoursePublishedSuccess
        onBackToCourses={() => router.push("/dashboard")}
        onClose={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Main Content Area */}
      <div className="flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ←
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Create Course
            </h1>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={loading}
              className="border-gray-300 cursor-pointer rounded-[999px] w-full sm:w-auto"
            >
              Save as Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer rounded-[999px] px-4 sm:px-5 py-2.5 sm:py-3 text-white w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Course"
              )}
            </Button>
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Mobile Tabs */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("information")}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                activeTab === "information"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Course Information
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                activeTab === "curriculum"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Curriculum Builder
            </button>
          </div>

          {/* Tab Sidebar (Desktop) */}
          <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4">
            <button
              onClick={() => setActiveTab("information")}
              className={`w-full text-left px-5 py-3 rounded-xl mb-4 transition-all ${
                activeTab === "information"
                  ? "bg-[#FAFAFA] border border-[#E5E5E5] text-black font-bold"
                  : "text-gray-500 hover:text-gray-700 font-medium border border-transparent"
              }`}
            >
              Course Information
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`w-full text-left px-5 py-3 rounded-xl transition-all ${
                activeTab === "curriculum"
                  ? "bg-[#FAFAFA] border border-[#E5E5E5] text-black font-bold"
                  : "text-gray-500 hover:text-gray-700 font-medium border border-transparent"
              }`}
            >
              Curriculum Builder
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
            {activeTab === "information" ? (
              <CourseInformationTab
                courseData={courseData}
                handleInputChange={handleInputChange}
                thumbnailPreview={thumbnailPreview}
                handleThumbnailSelect={handleThumbnailSelect}
                removeThumbnail={removeThumbnail}
                error={error}
              />
            ) : (
              <CurriculumBuilderTab
                modules={modules}
                selectedLesson={selectedLesson}
                setSelectedLesson={setSelectedLesson}
                addModule={addModule}
                addLesson={addLesson}
                deleteModule={deleteModule}
                deleteLesson={deleteLesson}
                updateModuleTitle={updateModuleTitle}
                updateLessonTitle={updateLessonTitle}
                editingModule={editingModule}
                editingLesson={editingLesson}
                toggleEditModule={toggleEditModule}
                toggleEditLesson={toggleEditLesson}
                getCurrentLessonContent={getCurrentLessonContent}
                updateLessonContent={updateLessonContent}
                openMediaModal={openMediaModal}
                insertLink={insertLink}
              />
            )}
          </div>
        </div>
      </div>

      {/* Media Upload Modal */}
      {showMediaModal && (
        <MediaUploadModal
          mediaType={mediaType}
          onClose={() => setShowMediaModal(false)}
          onUpload={handleMediaUpload}
          uploading={uploadingMedia}
          error={error}
        />
      )}
    </div>
  );
}

// LessonContentPreview removed as it is replaced by TipTapEditor in read-only mode

// Course Information Tab Component... (SAME AS BEFORE)
function CourseInformationTab({
  courseData,
  handleInputChange,
  thumbnailPreview,
  handleThumbnailSelect,
  removeThumbnail,
  error,
}) {
  return (
    <div className="max-w-5xl">
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Course Information
        </h2>
        <p className="text-gray-500 text-sm">
          Add details that describe your course and help learners know what to
          expect
        </p>
      </div>

      <div className="space-y-8">
        {/* Course Thumbnail */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Course Thumbnail
          </label>
          <div className="flex-1 flex items-center gap-4">
            {/* Thumbnail Preview or Placeholder */}
            <div className="relative flex-shrink-0">
              {thumbnailPreview ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  {/* Placeholder circle matching design */}
                </div>
              )}
            </div>

            <label
              htmlFor="thumbnail"
              className="px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 bg-white cursor-pointer transition-colors"
            >
              Choose
              <input
                id="thumbnail"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailSelect}
              />
            </label>
            <span className="text-gray-400 text-sm">JPG or PNG. 1MB max</span>
          </div>
        </div>

        {/* Course Title */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Course Title
          </label>
          <div className="flex-1">
            <Input
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              placeholder="Web3 Development for Beginners"
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Short Description
          </label>
          <div className="flex-1">
            <Input
              name="shortDescription"
              value={courseData.shortDescription}
              onChange={handleInputChange}
              placeholder="Brief summary of what learners will achieve"
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {/* Full Description */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">
            Full Description
          </label>
          <div className="flex-1">
            <Input
              name="fullDescription"
              value={courseData.fullDescription}
              onChange={handleInputChange}
              placeholder="Add an introduction to your course content."
              className="w-full rounded-xl border-gray-200 bg-white px-4 py-6 text-base focus-visible:ring-cyan-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Curriculum Builder Tab Component - REPLACED WITH ENHANCED VERSION
function CurriculumBuilderTab({
  modules,
  selectedLesson,
  setSelectedLesson,
  addModule,
  addLesson,
  deleteModule,
  deleteLesson,
  updateModuleTitle,
  updateLessonTitle,
  editingModule,
  editingLesson,
  toggleEditModule,
  toggleEditLesson,
  getCurrentLessonContent,
  updateLessonContent,
  openMediaModal,
  insertLink,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Curriculum Builder
      </h2>
      <p className="text-gray-600 mb-8">
        Create course modules, add lessons, and include text, video, or files in
        each lesson
      </p>

      <div className="space-y-8">
        {/* Modules Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Modules</h3>
          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="border border-cyan-200 bg-cyan-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  {editingModule === module.id ? (
                    <Input
                      value={module.title}
                      onChange={(e) =>
                        updateModuleTitle(module.id, e.target.value)
                      }
                      onBlur={() => toggleEditModule(module.id)}
                      autoFocus
                      className="flex-1 mr-2 bg-white"
                    />
                  ) : (
                    <span className="font-medium text-gray-900 flex-1">
                      {module.title}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEditModule(module.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteModule(module.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => addLesson(module.id)}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Lesson to this Module
                </button>
              </div>
            ))}
            <button
              onClick={addModule}
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm"
            >
              <Plus size={16} />
              Add Module
            </button>
          </div>
        </div>

        {/* Lessons Section */}
        {modules.some((m) => m.lessons.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lessons
            </h3>
            <div className="space-y-3">
              {modules.map((module) =>
                module.lessons.map((lesson) => (
                  <div
                    key={`${module.id}-${lesson.id}`}
                    onClick={() =>
                      setSelectedLesson({
                        moduleId: module.id,
                        lessonId: lesson.id,
                      })
                    }
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedLesson?.moduleId === module.id &&
                      selectedLesson?.lessonId === lesson.id
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-cyan-200 bg-cyan-50 hover:border-cyan-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {editingLesson === lesson.id ? (
                        <Input
                          value={lesson.title}
                          onChange={(e) =>
                            updateLessonTitle(
                              module.id,
                              lesson.id,
                              e.target.value
                            )
                          }
                          onBlur={() => toggleEditLesson(lesson.id)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="flex-1 mr-2 bg-white"
                        />
                      ) : (
                        <span className="font-medium text-gray-900 flex-1">
                          {lesson.title}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEditLesson(lesson.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLesson(module.id, lesson.id);
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Lesson Content Editor */}
        {selectedLesson && (
          <div
            className={
              isExpanded
                ? "fixed inset-0 z-50 bg-white p-4 sm:p-8 flex flex-col"
                : "relative h-[420px] sm:h-[520px] md:h-[600px] flex flex-col"
            }
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isExpanded ? (
                  <span>
                    Editing:{" "}
                    {
                      modules
                        .find((m) => m.id === selectedLesson.moduleId)
                        ?.lessons.find((l) => l.id === selectedLesson.lessonId)
                        ?.title
                    }
                  </span>
                ) : (
                  "Lesson Content"
                )}
              </h3>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="gap-2"
                >
                  {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  {isPreviewMode ? "Edit Mode" : "Preview"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="gap-2"
                >
                  {isExpanded ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                  {isExpanded ? "Collapse" : "Expand"}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {isPreviewMode ? (
                <div className="border border-gray-200 rounded-lg p-6 bg-white h-full overflow-y-auto prose prose-lg max-w-none">
                  <TipTapEditor
                    content={getCurrentLessonContent()}
                    editable={false}
                    onChange={() => {}}
                  />
                </div>
              ) : (
                <TipTapEditor
                  content={getCurrentLessonContent()}
                  onChange={updateLessonContent}
                  onAddImage={() => openMediaModal("image")}
                  onAddVideo={() => openMediaModal("video")}
                  onAddAudio={() => openMediaModal("audio")}
                  onAddDocument={() => openMediaModal("document")}
                />
              )}
            </div>
            {!isPreviewMode && (
              <p className="text-xs text-gray-500 mt-2">Auto-saving...</p>
            )}
          </div>
        )}

        {!selectedLesson && modules.some((m) => m.lessons.length > 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Select a lesson to edit its content</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Media Upload Modal Component
function MediaUploadModal({ mediaType, onClose, onUpload, uploading, error }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview for images
    if (mediaType === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const getAcceptedTypes = () => {
    switch (mediaType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "audio":
        return "audio/*";
      case "document":
        return ".pdf,.doc,.docx,.txt";
      default:
        return "*";
    }
  };

  const getTitle = () => {
    switch (mediaType) {
      case "image":
        return "Upload Image";
      case "video":
        return "Upload Video";
      case "audio":
        return "Upload Audio";
      case "document":
        return "Upload Document";
      default:
        return "Upload File";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  Click to select file
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {mediaType === "video" && "MP4, WebM (max 200MB)"}
                  {mediaType === "image" && "JPG, PNG (max 10MB)"}
                  {mediaType === "audio" && "MP3, WAV (max 50MB)"}
                  {mediaType === "document" && "PDF, DOC, TXT (max 10MB)"}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept={getAcceptedTypes()}
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {preview && (
                <div className="w-full h-48 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="text-sm text-red-600 hover:text-red-700"
                disabled={uploading}
              >
                Remove file
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="outline" disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload & Insert"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

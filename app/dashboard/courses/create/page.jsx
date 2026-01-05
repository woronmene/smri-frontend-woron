"use client";

import { useState, useContext, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import {
  Upload,
  Loader2,
  X,
  Plus,
  Edit2,
  Trash2,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import {
  uploadMedia,
  getMediaItem,
  validateImage,
  validateVideo,
} from "@/lib/media-api";
import {
  createCourse,
  getCourseById,
  updateCourse,
  createModule,
  updateModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/cms-api";
import CoursePublishedSuccess from "@/components/dashboard/CoursePublishedSuccess";
import TipTapEditor from "@/components/dashboard/TipTapEditor";

export default function CreateCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    if (user && user.role !== "smri_admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);


  const [activeTab, setActiveTab] = useState("information");
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [error, setError] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'video', 'image', 'audio', 'document'
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveAction, setSaveAction] = useState(null);

  const [courseData, setCourseData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    thumbnailUrl: "",
    audience: "Student",
  });

  const [modules, setModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const editorRef = useRef(null);
  // Map to track tempId -> realBackendId to prevents duplicates on subsequent saves
  const backendIdMap = useRef(new Map());

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
            audience: course.audience || "Student",
          });

          if (course.modules) {
            setModules(
              course.modules.map((m) => ({
                ...m,
                id: m.id || Date.now() + Math.random(),
                lessons: (m.lessons || []).map((l) => ({
                  ...l,
                  id: l.id || Date.now() + Math.random(),
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
    if (confirm("Are you sure you want to delete this module and all its lessons?")) {
      setModules(modules.filter((m) => m.id !== moduleId));
      if (selectedLesson?.moduleId === moduleId) {
        setSelectedLesson(null);
      }
    }
  };

  const toggleEditModule = (moduleId) => {
    setEditingModule(editingModule === moduleId ? null : moduleId);
  };

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

  const deleteLessonHandler = (moduleId, lessonId) => {
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
    const lesson = module?.lessons.find((l) => l.id === selectedLesson.lessonId);
    return lesson?.content || "";
  };

  // --- NEW MEDIA INTEGRATION ---

  const openMediaModal = (type) => {
    setMediaType(type);
    setShowMediaModal(true);
  };

  const getContextForUpload = () => {
    // Determine Module # and Lesson #
    // Default to 1 if things are murky, or 0 for course level (though this fn calls for lesson assets)
    if (!selectedLesson) return { moduleNumber: 1, lessonNumber: 1 };
    
    // Find index of module
    const mIndex = modules.findIndex(m => m.id === selectedLesson.moduleId);
    if (mIndex === -1) return { moduleNumber: 1, lessonNumber: 1 };
    
    const module = modules[mIndex];
    const lIndex = module.lessons.findIndex(l => l.id === selectedLesson.lessonId);
    
    return {
      moduleNumber: mIndex + 1,
      lessonNumber: lIndex !== -1 ? lIndex + 1 : 1
    };
  };

  const handleMediaUpload = async (file) => {
    setUploadingMedia(true);
    setError("");

    try {
      if (!courseData.title) {
         throw new Error("Please enter a Course Title before uploading media.");
      }

      // Course ID - if not exists yet, we generate a temp one or just use 'temp-course'
      // The media service uses ID + Title to build path. 
      const cId = courseId || "new-course";
      const { moduleNumber, lessonNumber } = getContextForUpload();

      // 1. Upload
      const serviceMediaType = (mediaType === 'video' || mediaType === 'audio') ?  mediaType : 'image';
      
      const { mediaId } = await uploadMedia({
        file,
        mediaType: serviceMediaType, 
        courseId: cId,
        courseTitle: courseData.title,
        moduleNumber,
        lessonNumber
      });

      // 2. Handle Result
      let finalUrl = "";
      
      if (serviceMediaType === 'image' || serviceMediaType === 'audio') {
        // For images AND audio (new flow), we fetch the URL immediately.
        // Audio is now static file, just like Image.
        let item = null;
        for (let i = 0; i < 3; i++) {
           item = await getMediaItem(mediaId, serviceMediaType);
           if (item && (item.cloudfront_url || item.media_url)) break;
           await new Promise(r => setTimeout(r, 500));
        }
        
        if (item && (item.cloudfront_url || item.media_url)) {
          finalUrl = item.cloudfront_url || item.media_url;
        } else {
          // Fallback if we can't get the public URL (though we should)
           throw new Error("Uploaded, but failed to retrieve public URL. Try again.");
        }
        
        insertMediaIntoContent(finalUrl, mediaType, mediaId);
      } else {
        // For Video, it's Async MediaConvert pipeline. We insert a placeholder.
        insertMediaIntoContent(null, mediaType, mediaId);
      }

      setShowMediaModal(false);
      setUploadingMedia(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
      setUploadingMedia(false);
    }
  };

  const insertMediaIntoContent = (url, type, mediaId) => {
    const currentContent = getCurrentLessonContent();
    let mediaMarkup = "";

    switch (type) {
      case "image":
        mediaMarkup = `<img src="${url}" alt="Image" class="rounded-lg shadow-sm my-4" />`;
        break;
      case "video":
        // Pending State Placeholder
        mediaMarkup = `
          <div data-smri-media-id="${mediaId}" data-smri-media-type="video" class="smri-media-pending p-6 border-2 border-dashed border-cyan-200 rounded-xl bg-cyan-50 my-6 text-center">
             <p class="font-bold text-cyan-800 text-lg mb-1">Video Processing...</p>
             <p class="text-sm text-cyan-600 mb-2">Your video is being optimized for streaming.</p>
          </div>`;
        break;
      case "audio":
        // Now inserted directly as player
        // Use src attribute directly on audio tag for better TipTap parsing compat
        mediaMarkup = `
          <div class="my-4">
            <audio src="${url}" controls class="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>`;
        break;
      case "document":
        // If we managed to upload a document as an 'image' type (S3 doesn't care much, but service might)
        mediaMarkup = `<p><a href="${url}" target="_blank" class="text-cyan-600 font-medium underline flex items-center gap-2">📄 Download Document</a></p>`;
        break;
      default:
        mediaMarkup = `<p><a href="${url}">${url}</a></p>`;
    }

    console.log("Inserting media. EditorRef:", editorRef.current);
    if (editorRef.current) {
        editorRef.current.insertContent(mediaMarkup);
    } else {
        updateLessonContent(currentContent + mediaMarkup);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      const text = prompt("Enter link text:");
      const linkMarkup = `[${text || url}](${url})`;
      updateLessonContent(getCurrentLessonContent() + " " + linkMarkup);
    }
  };

  const saveCourseData = async (status) => {
    let thumbnailUrl = courseData.thumbnailUrl;
    
    // Upload thumbnail if new one selected
    if (thumbnailFile) {
        if (!courseData.title) throw new Error("Title required for upload context");
        const cId = courseId || "new-course";
        
        // Use Module 0, Lesson 0 for Course Level assets
        const { mediaId } = await uploadMedia({
            file: thumbnailFile,
            mediaType: 'image',
            courseId: cId,
            courseTitle: courseData.title,
            moduleNumber: 0,
            lessonNumber: 0
        });
        
        // Fetch URL
        let item = null;
        for (let i = 0; i < 3; i++) {
           item = await getMediaItem(mediaId, 'image');
           if (item && (item.cloudfront_url || item.media_url)) break;
           await new Promise(r => setTimeout(r, 500));
        }

        if (item && (item.cloudfront_url || item.media_url)) {
            thumbnailUrl = item.cloudfront_url || item.media_url;
        } else {
            throw new Error("Failed to resolve thumbnail URL");
        }
    }

    // Construct the FULL payload including nested modules and lessons.
    const coursePayload = {
      title: courseData.title,
      description: courseData.shortDescription || "",
      fullDescription: courseData.fullDescription || "",
      fullDescription: courseData.fullDescription || "",
      thumbnail: thumbnailUrl || null,
      audience: courseData.audience,
      category: "Technology",
      level: "Beginner",
      duration: "4 weeks",
      status: status,
      createdBy: user?.uid || "mock-user-id",
      createdByEmail: user?.email,
      
      // Nested Modules & Lessons
      modules: modules.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description || "",
          lessons: m.lessons.map((l, lIdx) => ({
              id: l.id,
              title: l.title,
              introduction: l.introduction || "",
              content: l.content || "", // HTML content
              duration: l.duration || "10 min",
              order: lIdx + 1,
              videoUrl: l.videoUrl || null
          }))
      }))
    };

    let savedCourse;
    if (courseId) {
      savedCourse = await updateCourse(courseId, coursePayload);
    } else {
      savedCourse = await createCourse(coursePayload);
    }
    
    return savedCourse.id;
  };

  const handleSaveDraft = async () => {
    setError("");
    setSaveAction("draft");
    setLoading(true);
    try {
      if (!courseData.title.trim()) throw new Error("Course title is required");
      if (!user) throw new Error("You must be signed in");
      if (!thumbnailFile && !courseData.thumbnailUrl) throw new Error("Please upload a course thumbnail to save as draft.");

      await saveCourseData("Draft");
      alert("Course saved as draft!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorTitle("Save Failed");
      setErrorMessage(err.message || "An unexpected error occurred.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setSaveAction(null);
    }
  };

  const handlePublish = async () => {
    setError("");
    setSaveAction("publish");
    setLoading(true);
    try {
      if (!courseData.title.trim()) throw new Error("Course title is required");
      if (!courseData.shortDescription.trim()) throw new Error("Short description is required");
      if (!thumbnailFile && !courseData.thumbnailUrl) throw new Error("Course thumbnail is required");
      if (modules.length === 0) throw new Error("Add at least one module");
      if (modules.some((m) => !m.lessons || m.lessons.length === 0))
        throw new Error("Each module must have at least one lesson");
      if (!user) throw new Error("You must be signed in");

      await saveCourseData("Published");
      setLoading(false);
      setSaveAction(null);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorTitle("Publish Failed");
      setErrorMessage(err.message || "An unexpected error occurred.");
      setShowErrorModal(true);
      setLoading(false);
      setSaveAction(null);
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
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">←</button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Course</h1>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={loading}
              className="border-gray-300 w-full sm:w-auto"
            >
              {loading && saveAction === "draft" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 px-4 sm:px-5 py-2.5 sm:py-3 text-white w-full sm:w-auto"
            >
              {loading && saveAction === "publish" ? (
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
                activeTab === "information" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              Course Information
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                activeTab === "curriculum" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
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
                deleteLesson={deleteLessonHandler}
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
                editorRef={editorRef}
              />
            )}
          </div>
        </div>
      </div>

      {showMediaModal && (
        <MediaUploadModal
          mediaType={mediaType}
          onClose={() => setShowMediaModal(false)}
          onUpload={handleMediaUpload}
          uploading={uploadingMedia}
          error={error}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          title={errorTitle}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}

function ErrorModal({ title, message, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
          <Button onClick={onClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3">
            Okay, I'll fix it
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sub-Components
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
        <h2 className="text-xl font-bold text-gray-900 mb-1">Course Information</h2>
        <p className="text-gray-500 text-sm">Add details that describe your course.</p>
      </div>

      <div className="space-y-8">
        {/* Thumbnail */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">Course Thumbnail</label>
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {thumbnailPreview ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                  <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                  <button onClick={removeThumbnail} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                 <div className="w-12 h-12 bg-blue-600 rounded-full" />
              )}
            </div>
            <label className="cursor-pointer px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 bg-white">
              Choose
              <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailSelect} />
            </label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-6 pb-8 border-b border-gray-100">
           <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm pt-2">Target Audience</label>
           <div className="flex-1 space-y-2">
              <div className="flex gap-4">
                 <button
                    onClick={() => handleInputChange({ target: { name: "audience", value: "Student" } })}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                       courseData.audience === "Student" 
                         ? "border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/20"
                         : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                 >
                    Students
                 </button>
                 <button
                    onClick={() => handleInputChange({ target: { name: "audience", value: "Teacher" } })}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                       courseData.audience === "Teacher"
                         ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20"
                         : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                 >
                    Teachers
                 </button>
              </div>
              <p className="text-xs text-gray-400">
                {courseData.audience === "Teacher" 
                  ? "This course will only be visible to teachers and school admins."
                  : "This course is available to all students enrolled in your school."}
              </p>
           </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">Course Title</label>
          <div className="flex-1">
            <Input name="title" value={courseData.title} onChange={handleInputChange} placeholder="Web3 Development" className="w-full rounded-xl py-6" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">Short Description</label>
          <div className="flex-1">
            <Input name="shortDescription" value={courseData.shortDescription} onChange={handleInputChange} className="w-full rounded-xl py-6" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
          <label className="w-full md:w-1/4 text-gray-500 font-medium text-sm">Full Description</label>
          <div className="flex-1">
            <Input name="fullDescription" value={courseData.fullDescription} onChange={handleInputChange} className="w-full rounded-xl py-6" />
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>}
      </div>
    </div>
  );
}

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
  editorRef,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Curriculum Builder</h2>
      <p className="text-gray-600 mb-8">Create course modules and lessons.</p>

      <div className="space-y-6">
        {modules.map((module, mIndex) => (
          <div key={module.id} className="border border-cyan-200 bg-cyan-50 rounded-xl p-6 transition-all">
            {/* Module Header */}
            <div className="flex items-center justify-between mb-4">
               {editingModule === module.id ? (
                 <Input 
                    value={module.title} 
                    onChange={(e) => updateModuleTitle(module.id, e.target.value)} 
                    onBlur={() => toggleEditModule(module.id)} 
                    autoFocus 
                    className="flex-1 mr-4 bg-white text-lg font-semibold" 
                 />
               ) : (
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wide mb-1">Module {mIndex + 1}</span>
                    <h3 onClick={() => toggleEditModule(module.id)} className="text-lg font-bold text-gray-900 cursor-pointer hover:text-cyan-700">
                       {module.title}
                    </h3>
                 </div>
               )}
               <div className="flex items-center gap-2">
                 <button onClick={() => toggleEditModule(module.id)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"><Edit2 size={16} /></button>
                 <button onClick={() => deleteModule(module.id)} className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-white transition-colors"><Trash2 size={16} /></button>
               </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-3 pl-4 border-l-2 border-cyan-200 ml-2">
               {module.lessons.map((lesson, lIndex) => {
                  const isSelected = selectedLesson?.lessonId === lesson.id;
                  return (
                    <div key={lesson.id} className="flex flex-col gap-2">
                       {/* Lesson Item */}
                       <div 
                         onClick={() => setSelectedLesson(isSelected ? null : { moduleId: module.id, lessonId: lesson.id })}
                         className={`relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                           isSelected 
                             ? "bg-white border-cyan-500 shadow-md ring-1 ring-cyan-500" 
                             : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-sm"
                         }`}
                       >
                          <div className="flex items-center gap-3 flex-1">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">
                                {lIndex + 1}
                             </span>
                             {editingLesson === lesson.id ? (
                               <Input 
                                  value={lesson.title} 
                                  onChange={(e) => updateLessonTitle(module.id, lesson.id, e.target.value)} 
                                  onBlur={() => toggleEditLesson(lesson.id)} 
                                  autoFocus 
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 h-8 text-sm" 
                               />
                             ) : (
                               <span className="font-medium text-gray-700">{lesson.title}</span>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                             <button onClick={(e) => { e.stopPropagation(); toggleEditLesson(lesson.id); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"><Edit2 size={14} /></button>
                             <button onClick={(e) => { e.stopPropagation(); deleteLesson(module.id, lesson.id); }} className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-gray-100"><Trash2 size={14} /></button>
                          </div>
                       </div>

                       {/* Inline Editor Area */}
                       {isSelected && (
                          <div className={`mt-2 border border-cyan-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${isExpanded ? "fixed inset-0 z-50 m-0 rounded-none h-screen flex flex-col" : ""}`}>
                             <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                  <Edit2 size={12}/> Editing Content
                                </span>
                                <div className="flex gap-2">
                                   <Button variant="ghost" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)} className="h-8 gap-2 text-xs">
                                      {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />} {isPreviewMode ? "Edit" : "Preview"}
                                   </Button>
                                   <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 gap-2 text-xs">
                                      {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                   </Button>
                                </div>
                             </div>
                             <div className="flex-1 overflow-hidden bg-white relative min-h-[400px]">
                                <TipTapEditor
                                    ref={editorRef}
                                    content={getCurrentLessonContent()}
                                    editable={!isPreviewMode}
                                    onChange={isPreviewMode ? () => {} : updateLessonContent}
                                    onAddImage={() => openMediaModal("image")}
                                    onAddVideo={() => openMediaModal("video")}
                                    onAddAudio={() => openMediaModal("audio")}
                                    onAddDocument={() => openMediaModal("document")}
                                />
                             </div>
                             {/* {!isPreviewMode && <div className="p-2 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">Changes auto-saved to draft</div>} */}
                          </div>
                       )}
                    </div>
                  );
               })}
               
               {/* Add Lesson Button */}
               <button 
                 onClick={() => addLesson(module.id)} 
                 className="w-full py-3 border-2 border-dashed border-cyan-200 rounded-lg text-sm font-medium text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300 transition-all flex items-center justify-center gap-2"
               >
                 <Plus size={16} /> Add Lesson to Module {mIndex + 1}
               </button>
            </div>
          </div>
        ))}

        {/* Add Module Button */}
        <button 
          onClick={addModule} 
          className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-lg font-medium text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New Module
        </button>
      </div>
    </div>
  );
}

function MediaUploadModal({ mediaType, onClose, onUpload, uploading, error }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (mediaType === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!uploading) return;
    setProgress(10);
    const id = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 250);
    return () => clearInterval(id);
  }, [uploading]);

  const getAcceptedTypes = () => {
    switch (mediaType) {
      case "image": return "image/*";
      case "video": return "video/*";
      case "audio": return "audio/*";
      case "document": return ".pdf,.doc,.docx,.txt";
      default: return "*";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between">
          <h3 className="text-lg font-semibold">Upload {mediaType}</h3>
          <button onClick={onClose} disabled={uploading} className="text-gray-400"><X size={20} /></button>
        </div>
        <div className="p-6">
          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-sm font-medium">Click to select file</span>
              <input type="file" className="hidden" accept={getAcceptedTypes()} onChange={handleFileSelect} disabled={uploading} />
            </label>
          ) : (
             <div className="space-y-4">
                {preview && <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />}
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <button onClick={() => { setSelectedFile(null); setPreview(null); }} className="text-red-500 text-sm" disabled={uploading}>Remove</button>
             </div>
          )}
          {error && <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded-lg">{error}</div>}
          {uploading && (
             <div className="mt-4 text-xs text-gray-500">
                Uploading... {progress}%
                <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} /></div>
             </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" disabled={uploading}>Cancel</Button>
          <Button onClick={() => onUpload(selectedFile)} disabled={!selectedFile || uploading} className="bg-cyan-500 text-white">
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading</> : "Upload & Insert"}
          </Button>
        </div>
      </div>
    </div>
  );
}

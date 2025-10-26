import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Template configurations
const templates = {
  classic: {
    name: "Classic Professional",
    primaryColor: "#1e40af",
    accentColor: "#3b82f6",
    fontFamily: "Georgia, serif",
    headerStyle: "traditional",
  },
  modern: {
    name: "Modern Minimal",
    primaryColor: "#7c3aed",
    accentColor: "#a78bfa",
    fontFamily: "'Inter', sans-serif",
    headerStyle: "minimal",
  },
  creative: {
    name: "Creative Bold",
    primaryColor: "#dc2626",
    accentColor: "#ef4444",
    fontFamily: "'Trebuchet MS', sans-serif",
    headerStyle: "creative",
  },
  simple: {
    name: "Simple Elegant",
    primaryColor: "#059669",
    accentColor: "#10b981",
    fontFamily: "'Arial', sans-serif",
    headerStyle: "simple",
  },
};

// Classic Template Component
const ClassicTemplate = ({ resumeData, settings, formatDate }: any) => (
  <div className="space-y-6">
    {/* Header - Traditional */}
    <div className="text-center border-b-4 pb-4" style={{ borderColor: settings.colorScheme }}>
      {settings.includeProfilePic && resumeData?.personalInfo?.PROFILE_PIC_URL && (
        <img
          src={resumeData.personalInfo.PROFILE_PIC_URL}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4"
          style={{ borderColor: settings.colorScheme }}
        />
      )}
      <h1 className="text-4xl font-bold mb-2" style={{ color: settings.colorScheme }}>
        {resumeData?.personalInfo?.F_NAME} {resumeData?.personalInfo?.L_NAME}
      </h1>
      <p className="text-xl text-gray-700 mb-2">{resumeData?.personalInfo?.HEADLINE}</p>
      <div className="text-sm text-gray-600">
        {resumeData?.personalInfo?.EMAIL} | {resumeData?.personalInfo?.CITY}, {resumeData?.personalInfo?.COUNTRY}
      </div>
    </div>

    {/* Bio */}
    {settings.includeBio && resumeData?.personalInfo?.BIO && (
      <div>
        <h2 className="text-2xl font-bold mb-3 uppercase" style={{ color: settings.colorScheme }}>
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed text-justify">{resumeData.personalInfo.BIO}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData?.experience?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 uppercase" style={{ color: settings.colorScheme }}>
          Experience
        </h2>
        <div className="space-y-4">
          {resumeData.experience.map((exp: any) => (
            <div key={exp.EXPERIENCE_ID}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg">{exp.JOB_TITLE}</h3>
                <span className="text-sm text-gray-600">
                  {formatDate(exp.START_DATE)} - {exp.IS_CURRENT ? "Present" : formatDate(exp.END_DATE)}
                </span>
              </div>
              <p className="font-semibold text-gray-700">{exp.COMPANY_NAME}</p>
              <p className="text-sm text-gray-600">{exp.LOCATION}</p>
              {exp.JOB_DESCRIPTION && (
                <p className="text-gray-700 mt-2 text-sm">{exp.JOB_DESCRIPTION}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {resumeData?.education?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 uppercase" style={{ color: settings.colorScheme }}>
          Education
        </h2>
        <div className="space-y-3">
          {resumeData.education.map((edu: any) => (
            <div key={edu.EDUCATION_ID}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{edu.INSTITUTION_NAME}</h3>
                  <p className="text-gray-700">{edu.DEGREE} in {edu.FIELD_OF_STUDY}</p>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDate(edu.START_DATE)} - {formatDate(edu.END_DATE)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {settings.includeProjects && resumeData?.projects?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 uppercase" style={{ color: settings.colorScheme }}>
          Projects
        </h2>
        <div className="space-y-3">
          {resumeData.projects.map((project: any) => (
            <div key={project.PROJECT_ID}>
              <h3 className="font-bold text-lg">{project.PROJECT_TITLE}</h3>
              <p className="text-gray-700 text-sm mt-1">{project.DESCRIPTION}</p>
              {project.TECHNOLOGIES_USED && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Technologies:</strong> {project.TECHNOLOGIES_USED}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {resumeData?.skills?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 uppercase" style={{ color: settings.colorScheme }}>
          Skills
        </h2>
        <div className="flex flex-wrap gap-3">
          {resumeData.skills.map((skill: any) => (
            <span
              key={skill.SKILL_ID}
              className="px-4 py-2 rounded text-sm font-semibold text-white"
              style={{ backgroundColor: settings.colorScheme }}
            >
              {skill.SKILL}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Modern Template Component
const ModernTemplate = ({ resumeData, settings, formatDate }: any) => (
  <div className="space-y-6">
    {/* Header - Minimal Side by Side */}
    <div className="flex items-start gap-6 pb-4 border-b-2" style={{ borderColor: settings.colorScheme }}>
      {settings.includeProfilePic && resumeData?.personalInfo?.PROFILE_PIC_URL && (
        <img
          src={resumeData.personalInfo.PROFILE_PIC_URL}
          alt="Profile"
          className="w-24 h-24 rounded object-cover"
        />
      )}
      <div className="flex-1">
        <h1 className="text-5xl font-light mb-1" style={{ color: settings.colorScheme }}>
          {resumeData?.personalInfo?.F_NAME} {resumeData?.personalInfo?.L_NAME}
        </h1>
        <p className="text-lg text-gray-600 mb-2">{resumeData?.personalInfo?.HEADLINE}</p>
        <div className="text-sm text-gray-600 flex gap-4">
          <span>{resumeData?.personalInfo?.EMAIL}</span>
          <span>|</span>
          <span>{resumeData?.personalInfo?.CITY}, {resumeData?.personalInfo?.COUNTRY}</span>
        </div>
      </div>
    </div>

    {/* Bio */}
    {settings.includeBio && resumeData?.personalInfo?.BIO && (
      <div>
        <h2 className="text-xl font-light mb-3 pb-1 border-b" style={{ color: settings.colorScheme }}>
          About
        </h2>
        <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.BIO}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData?.experience?.length > 0 && (
      <div>
        <h2 className="text-xl font-light mb-3 pb-1 border-b" style={{ color: settings.colorScheme }}>
          Experience
        </h2>
        <div className="space-y-5">
          {resumeData.experience.map((exp: any) => (
            <div key={exp.EXPERIENCE_ID} className="pl-4 border-l-2" style={{ borderColor: settings.colorScheme }}>
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-lg">{exp.JOB_TITLE}</h3>
                <span className="text-xs text-gray-500">
                  {formatDate(exp.START_DATE)} - {exp.IS_CURRENT ? "Present" : formatDate(exp.END_DATE)}
                </span>
              </div>
              <p className="text-gray-700 font-medium">{exp.COMPANY_NAME}</p>
              {exp.JOB_DESCRIPTION && (
                <p className="text-gray-600 mt-2 text-sm">{exp.JOB_DESCRIPTION}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {resumeData?.education?.length > 0 && (
      <div>
        <h2 className="text-xl font-light mb-3 pb-1 border-b" style={{ color: settings.colorScheme }}>
          Education
        </h2>
        <div className="space-y-3">
          {resumeData.education.map((edu: any) => (
            <div key={edu.EDUCATION_ID} className="pl-4 border-l-2" style={{ borderColor: settings.colorScheme }}>
              <h3 className="font-semibold">{edu.DEGREE} in {edu.FIELD_OF_STUDY}</h3>
              <p className="text-gray-700">{edu.INSTITUTION_NAME}</p>
              <p className="text-xs text-gray-500">
                {formatDate(edu.START_DATE)} - {formatDate(edu.END_DATE)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {settings.includeProjects && resumeData?.projects?.length > 0 && (
      <div>
        <h2 className="text-xl font-light mb-3 pb-1 border-b" style={{ color: settings.colorScheme }}>
          Projects
        </h2>
        <div className="space-y-4">
          {resumeData.projects.map((project: any) => (
            <div key={project.PROJECT_ID}>
              <h3 className="font-semibold">{project.PROJECT_TITLE}</h3>
              <p className="text-gray-700 text-sm mt-1">{project.DESCRIPTION}</p>
              {project.TECHNOLOGIES_USED && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.TECHNOLOGIES_USED.split(",").map((tech: string, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-200 rounded">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {resumeData?.skills?.length > 0 && (
      <div>
        <h2 className="text-xl font-light mb-3 pb-1 border-b" style={{ color: settings.colorScheme }}>
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill: any) => (
            <span
              key={skill.SKILL_ID}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: settings.colorScheme, color: 'white' }}
            >
              {skill.SKILL}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Creative Template Component
const CreativeTemplate = ({ resumeData, settings, formatDate }: any) => (
  <div className="space-y-6">
    {/* Header - Creative with Color Block */}
    <div className="relative">
      <div className="absolute top-0 left-0 w-32 h-full opacity-10" style={{ backgroundColor: settings.colorScheme }} />
      <div className="relative pl-8 py-6">
        <div className="flex items-center gap-6">
          {settings.includeProfilePic && resumeData?.personalInfo?.PROFILE_PIC_URL && (
            <img
              src={resumeData.personalInfo.PROFILE_PIC_URL}
              alt="Profile"
              className="w-28 h-28 rounded-lg object-cover shadow-lg"
              style={{ border: `4px solid ${settings.colorScheme}` }}
            />
          )}
          <div>
            <h1 className="text-5xl font-bold mb-2" style={{ color: settings.colorScheme }}>
              {resumeData?.personalInfo?.F_NAME}
              <br />
              {resumeData?.personalInfo?.L_NAME}
            </h1>
            <p className="text-xl text-gray-700 font-medium">{resumeData?.personalInfo?.HEADLINE}</p>
            <div className="text-sm text-gray-600 mt-2">
              {resumeData?.personalInfo?.EMAIL} • {resumeData?.personalInfo?.CITY}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bio */}
    {settings.includeBio && resumeData?.personalInfo?.BIO && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-3" style={{ color: settings.colorScheme }}>
          ⚡ About Me
        </h2>
        <p className="text-gray-700 leading-relaxed italic">{resumeData.personalInfo.BIO}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData?.experience?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: settings.colorScheme }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                style={{ backgroundColor: settings.colorScheme }}>💼</span>
          Experience
        </h2>
        <div className="space-y-4">
          {resumeData.experience.map((exp: any, index: number) => (
            <div key={exp.EXPERIENCE_ID} className="relative pl-6">
              <div className="absolute left-0 top-2 w-3 h-3 rounded-full" style={{ backgroundColor: settings.colorScheme }} />
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg" style={{ color: settings.colorScheme }}>{exp.JOB_TITLE}</h3>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {formatDate(exp.START_DATE)} - {exp.IS_CURRENT ? "Present" : formatDate(exp.END_DATE)}
                  </span>
                </div>
                <p className="font-semibold text-gray-700">{exp.COMPANY_NAME}</p>
                {exp.JOB_DESCRIPTION && (
                  <p className="text-gray-600 mt-2 text-sm">{exp.JOB_DESCRIPTION}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {resumeData?.education?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: settings.colorScheme }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                style={{ backgroundColor: settings.colorScheme }}>🎓</span>
          Education
        </h2>
        <div className="space-y-3">
          {resumeData.education.map((edu: any) => (
            <div key={edu.EDUCATION_ID} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg" style={{ color: settings.colorScheme }}>{edu.DEGREE}</h3>
              <p className="text-gray-700 font-medium">{edu.INSTITUTION_NAME}</p>
              <p className="text-sm text-gray-600">{edu.FIELD_OF_STUDY}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {settings.includeProjects && resumeData?.projects?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: settings.colorScheme }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                style={{ backgroundColor: settings.colorScheme }}>🚀</span>
          Projects
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {resumeData.projects.map((project: any) => (
            <div key={project.PROJECT_ID} className="border-2 p-4 rounded-lg" style={{ borderColor: settings.colorScheme }}>
              <h3 className="font-bold mb-2" style={{ color: settings.colorScheme }}>{project.PROJECT_TITLE}</h3>
              <p className="text-gray-700 text-xs">{project.DESCRIPTION}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {resumeData?.skills?.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: settings.colorScheme }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                style={{ backgroundColor: settings.colorScheme }}>⚡</span>
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill: any) => (
            <span
              key={skill.SKILL_ID}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-md"
              style={{ backgroundColor: settings.colorScheme }}
            >
              {skill.SKILL}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Simple Template Component
const SimpleTemplate = ({ resumeData, settings, formatDate }: any) => (
  <div className="space-y-5">
    {/* Header - Clean and Simple */}
    <div className="pb-4 border-b">
      <div className="flex items-start gap-4">
        {settings.includeProfilePic && resumeData?.personalInfo?.PROFILE_PIC_URL && (
          <img
            src={resumeData.personalInfo.PROFILE_PIC_URL}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-semibold mb-1" style={{ color: settings.colorScheme }}>
            {resumeData?.personalInfo?.F_NAME} {resumeData?.personalInfo?.L_NAME}
          </h1>
          <p className="text-lg text-gray-600">{resumeData?.personalInfo?.HEADLINE}</p>
          <p className="text-sm text-gray-600 mt-1">
            {resumeData?.personalInfo?.EMAIL} | {resumeData?.personalInfo?.CITY}, {resumeData?.personalInfo?.COUNTRY}
          </p>
        </div>
      </div>
    </div>

    {/* Bio */}
    {settings.includeBio && resumeData?.personalInfo?.BIO && (
      <div>
        <h2 className="text-lg font-semibold mb-2 uppercase tracking-wide" style={{ color: settings.colorScheme }}>
          Summary
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">{resumeData.personalInfo.BIO}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData?.experience?.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: settings.colorScheme }}>
          Experience
        </h2>
        <div className="space-y-3">
          {resumeData.experience.map((exp: any) => (
            <div key={exp.EXPERIENCE_ID}>
              <div className="flex justify-between">
                <h3 className="font-semibold">{exp.JOB_TITLE}</h3>
                <span className="text-xs text-gray-500">
                  {formatDate(exp.START_DATE)} - {exp.IS_CURRENT ? "Present" : formatDate(exp.END_DATE)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{exp.COMPANY_NAME} • {exp.LOCATION}</p>
              {exp.JOB_DESCRIPTION && (
                <p className="text-xs text-gray-600 mt-1">{exp.JOB_DESCRIPTION}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {resumeData?.education?.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: settings.colorScheme }}>
          Education
        </h2>
        <div className="space-y-2">
          {resumeData.education.map((edu: any) => (
            <div key={edu.EDUCATION_ID}>
              <div className="flex justify-between">
                <h3 className="font-semibold">{edu.DEGREE}</h3>
                <span className="text-xs text-gray-500">
                  {formatDate(edu.START_DATE)} - {formatDate(edu.END_DATE)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.INSTITUTION_NAME}</p>
              <p className="text-xs text-gray-600">{edu.FIELD_OF_STUDY}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {settings.includeProjects && resumeData?.projects?.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: settings.colorScheme }}>
          Projects
        </h2>
        <div className="space-y-2">
          {resumeData.projects.map((project: any) => (
            <div key={project.PROJECT_ID}>
              <h3 className="font-semibold text-sm">{project.PROJECT_TITLE}</h3>
              <p className="text-xs text-gray-700">{project.DESCRIPTION}</p>
              {project.TECHNOLOGIES_USED && (
                <p className="text-xs text-gray-600 mt-1">{project.TECHNOLOGIES_USED}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {resumeData?.skills?.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color: settings.colorScheme }}>
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill: any) => (
            <span
              key={skill.SKILL_ID}
              className="text-xs px-3 py-1 border-2 rounded"
              style={{ borderColor: settings.colorScheme, color: settings.colorScheme }}
            >
              {skill.SKILL}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ResumeBuilder = () => {
  const { userId } = useAuthStore();
  const resumeRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState({
    templateId: "classic",
    includeProfilePic: true,
    includeBio: true,
    includeProjects: true,
    sectionsOrder: ["education", "experience", "projects", "skills"],
    colorScheme: "#1e40af",
    fontStyle: "Arial",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const { data: resumeData, isLoading } = useQuery({
    queryKey: ["resume", userId],
    queryFn: async () => {
      const { data } = await api.get(`/resume/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    setIsGenerating(true);
    toast.loading("Generating PDF...", { id: "pdf-generation" });

    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const fileName = `${resumeData?.personalInfo?.F_NAME}_${resumeData?.personalInfo?.L_NAME}_Resume.pdf`;
      pdf.save(fileName);

      toast.success("Resume downloaded successfully!", { id: "pdf-generation" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: "pdf-generation" });
    } finally {
      setIsGenerating(false);
    }
  };

  // Render the selected template
  const renderTemplate = () => {
    const templateProps = { resumeData, settings, formatDate };
    
    switch (settings.templateId) {
      case "modern":
        return <ModernTemplate {...templateProps} />;
      case "creative":
        return <CreativeTemplate {...templateProps} />;
      case "simple":
        return <SimpleTemplate {...templateProps} />;
      case "classic":
      default:
        return <ClassicTemplate {...templateProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Resume Builder</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div>
                  <Label>Resume Template</Label>
                  <Select
                    value={settings.templateId}
                    onValueChange={(value) =>
                      setSettings({ ...settings, templateId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sections to Include */}
                <div>
                  <Label className="mb-3 block">Include Sections</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="profilePic"
                        checked={settings.includeProfilePic}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, includeProfilePic: checked as boolean })
                        }
                      />
                      <Label htmlFor="profilePic" className="cursor-pointer">
                        Profile Picture
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bio"
                        checked={settings.includeBio}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, includeBio: checked as boolean })
                        }
                      />
                      <Label htmlFor="bio" className="cursor-pointer">
                        Bio/Summary
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="projects"
                        checked={settings.includeProjects}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, includeProjects: checked as boolean })
                        }
                      />
                      <Label htmlFor="projects" className="cursor-pointer">
                        Projects
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {["#1e40af", "#7c3aed", "#dc2626", "#059669", "#000000"].map((color) => (
                      <button
                        key={color}
                        className={`h-10 w-full rounded border-2 ${
                          settings.colorScheme === color ? "border-gray-900 ring-2 ring-offset-2" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSettings({ ...settings, colorScheme: color })}
                      />
                    ))}
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resume Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview - {templates[settings.templateId as keyof typeof templates].name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={resumeRef}
                  className="bg-white shadow-lg mx-auto"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    padding: "20mm",
                    fontFamily: settings.fontStyle,
                  }}
                >
                  {renderTemplate()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

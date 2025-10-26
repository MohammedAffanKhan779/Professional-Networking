import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Briefcase, 
  Calendar,
  GraduationCap,
  Code2,
  Github,
  ExternalLink,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-hot-toast";
import { useState } from "react";
import ExperienceModal from "@/components/modals/ExperienceModal";
import EducationModal from "@/components/modals/EducationModal";
import SkillModal from "@/components/modals/SkillModal";
import ProjectModal from "@/components/modals/ProjectModal";

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

const Profile = () => {
  const { userId } = useParams();
  const { userId: currentUserId } = useAuthStore();
  const isOwnProfile = userId === currentUserId?.toString();
  const queryClient = useQueryClient();

  // Modal states
  const [experienceModal, setExperienceModal] = useState({ open: false, data: null });
  const [educationModal, setEducationModal] = useState({ open: false, data: null });
  const [skillModal, setSkillModal] = useState({ open: false, data: null });
  const [projectModal, setProjectModal] = useState({ open: false, data: null });

  // Fetch queries
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
  });

  const { data: experiences, isLoading: loadingExperience } = useQuery({
    queryKey: ["experience", userId],
    queryFn: async () => {
      const { data } = await api.get(`/experience/user/${userId}`);
      return data;
    },
  });

  const { data: educations, isLoading: loadingEducation } = useQuery({
    queryKey: ["education", userId],
    queryFn: async () => {
      const { data } = await api.get(`/education/user/${userId}`);
      return data;
    },
  });

  const { data: skills, isLoading: loadingSkills } = useQuery({
    queryKey: ["skills", userId],
    queryFn: async () => {
      const { data } = await api.get(`/skills/user/${userId}`);
      return data;
    },
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects", userId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/user/${userId}`);
      return data;
    },
  });

  // Delete mutations
  const deleteExperience = useMutation({
    mutationFn: (id: number) => api.delete(`/experience/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience", userId] });
      toast.success("Experience deleted!");
    },
  });

  const deleteEducation = useMutation({
    mutationFn: (id: number) => api.delete(`/education/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education", userId] });
      toast.success("Education deleted!");
    },
  });

  const deleteSkill = useMutation({
    mutationFn: (id: number) => api.delete(`/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", userId] });
      toast.success("Skill deleted!");
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", userId] });
      toast.success("Project deleted!");
    },
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "Expert": return "bg-green-500";
      case "Advanced": return "bg-blue-500";
      case "Intermediate": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg"></div>
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-12">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={user?.PROFILE_PIC_URL} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user?.F_NAME, user?.L_NAME)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 mt-16 md:mt-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {user?.F_NAME} {user?.L_NAME}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">{user?.HEADLINE}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      {user?.CITY && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.CITY}, {user?.COUNTRY}
                        </span>
                      )}
                      {user?.INDUSTRY && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {user.INDUSTRY}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <Button className="mt-4 md:mt-0">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        {user?.BIO && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{user.BIO}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExperienceModal({ open: true, data: null })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingExperience ? (
              <div className="text-center py-4">Loading...</div>
            ) : experiences?.length > 0 ? (
              <div className="space-y-6">
                {experiences.map((exp: any, index: number) => (
                  <div key={exp.EXPERIENCE_ID}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{exp.JOB_TITLE}</h3>
                        <p className="text-gray-600">{exp.COMPANY_NAME}</p>
                        <p className="text-sm text-gray-500">
                          {exp.EMPLOYMENT_TYPE} • {exp.LOCATION}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(exp.START_DATE)} - {exp.IS_CURRENT ? "Present" : formatDate(exp.END_DATE)}
                        </p>
                        {exp.JOB_DESCRIPTION && (
                          <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                            {exp.JOB_DESCRIPTION}
                          </p>
                        )}
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExperienceModal({ open: true, data: exp })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteExperience.mutate(exp.EXPERIENCE_ID)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No experience added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEducationModal({ open: true, data: null })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingEducation ? (
              <div className="text-center py-4">Loading...</div>
            ) : educations?.length > 0 ? (
              <div className="space-y-6">
                {educations.map((edu: any, index: number) => (
                  <div key={edu.EDUCATION_ID}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{edu.INSTITUTION_NAME}</h3>
                        <p className="text-gray-600">
                          {edu.DEGREE} • {edu.FIELD_OF_STUDY}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(edu.START_DATE)} - {formatDate(edu.END_DATE)}
                        </p>
                        {edu.DESCRIPTION && (
                          <p className="text-gray-700 mt-3">{edu.DESCRIPTION}</p>
                        )}
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEducationModal({ open: true, data: edu })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteEducation.mutate(edu.EDUCATION_ID)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No education added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Skills
            </CardTitle>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSkillModal({ open: true, data: null })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingSkills ? (
              <div className="text-center py-4">Loading...</div>
            ) : skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any) => (
                  <Badge
                    key={skill.SKILL_ID}
                    variant="secondary"
                    className={`${getProficiencyColor(skill.PROFICIENCY_LVL)} text-white hover:opacity-80 cursor-pointer group relative`}
                  >
                    {skill.SKILL} • {skill.PROFICIENCY_LVL}
                    {isOwnProfile && (
                      <button
                        onClick={() => deleteSkill.mutate(skill.SKILL_ID)}
                        className="ml-2 hover:text-red-200"
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No skills added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Projects
            </CardTitle>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setProjectModal({ open: true, data: null })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="text-center py-4">Loading...</div>
            ) : projects?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project: any) => (
                  <Card key={project.PROJECT_ID} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.PROJECT_TITLE}</CardTitle>
                        {isOwnProfile && (
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setProjectModal({ open: true, data: project })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteProject.mutate(project.PROJECT_ID)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(project.START_DATE)} - {project.IS_ONGOING ? "Ongoing" : formatDate(project.END_DATE)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-3">{project.DESCRIPTION}</p>
                      {project.TECHNOLOGIES_USED && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.TECHNOLOGIES_USED.split(",").map((tech: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {tech.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {project.PROJECT_URL && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.PROJECT_URL} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        )}
                        {project.GITHUB_URL && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.GITHUB_URL} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No projects added yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ExperienceModal
        open={experienceModal.open}
        onClose={() => setExperienceModal({ open: false, data: null })}
        experience={experienceModal.data}
        userId={userId!}
      />
      <EducationModal
        open={educationModal.open}
        onClose={() => setEducationModal({ open: false, data: null })}
        education={educationModal.data}
        userId={userId!}
      />
      <SkillModal
        open={skillModal.open}
        onClose={() => setSkillModal({ open: false, data: null })}
        skill={skillModal.data}
        userId={userId!}
      />
      <ProjectModal
        open={projectModal.open}
        onClose={() => setProjectModal({ open: false, data: null })}
        project={projectModal.data}
        userId={userId!}
      />
    </div>
  );
};

export default Profile;

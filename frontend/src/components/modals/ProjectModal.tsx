import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";

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

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project?: any;
  userId: string;
}

const ProjectModal = ({ open, onClose, project, userId }: ProjectModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!project;

  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    technologiesUsed: "",
    projectUrl: "",
    githubUrl: "",
    startDate: "",
    endDate: "",
    isOngoing: false,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        projectTitle: project.PROJECT_TITLE || "",
        description: project.DESCRIPTION || "",
        technologiesUsed: project.TECHNOLOGIES_USED || "",
        projectUrl: project.PROJECT_URL || "",
        githubUrl: project.GITHUB_URL || "",
        startDate: project.START_DATE?.split("T")[0] || "",
        endDate: project.END_DATE?.split("T")[0] || "",
        isOngoing: project.IS_ONGOING || false,
      });
    } else {
      setFormData({
        projectTitle: "",
        description: "",
        technologiesUsed: "",
        projectUrl: "",
        githubUrl: "",
        startDate: "",
        endDate: "",
        isOngoing: false,
      });
    }
  }, [project, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        return api.put(`/projects/${project.PROJECT_ID}`, data);
      } else {
        return api.post("/projects", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", userId] });
      toast.success(isEdit ? "Project updated!" : "Project added!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="projectTitle">Project Title *</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project and its impact..."
              rows={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="technologiesUsed">Technologies Used</Label>
            <Input
              id="technologiesUsed"
              value={formData.technologiesUsed}
              onChange={(e) => setFormData({ ...formData, technologiesUsed: e.target.value })}
              placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
            />
          </div>

          <div>
            <Label htmlFor="projectUrl">Project URL</Label>
            <Input
              id="projectUrl"
              type="url"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.isOngoing}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOngoing"
              checked={formData.isOngoing}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isOngoing: checked as boolean, endDate: "" })
              }
            />
            <Label htmlFor="isOngoing" className="cursor-pointer">
              This is an ongoing project
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;

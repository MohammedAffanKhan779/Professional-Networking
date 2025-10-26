import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface ExperienceModalProps {
  open: boolean;
  onClose: () => void;
  experience?: any;
  userId: string;
}

const ExperienceModal = ({ open, onClose, experience, userId }: ExperienceModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!experience;

  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    employmentType: "Full-time",
    location: "",
    jobDescription: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        companyName: experience.COMPANY_NAME || "",
        jobTitle: experience.JOB_TITLE || "",
        employmentType: experience.EMPLOYMENT_TYPE || "Full-time",
        location: experience.LOCATION || "",
        jobDescription: experience.JOB_DESCRIPTION || "",
        startDate: experience.START_DATE?.split("T")[0] || "",
        endDate: experience.END_DATE?.split("T")[0] || "",
        isCurrent: experience.IS_CURRENT || false,
      });
    } else {
      setFormData({
        companyName: "",
        jobTitle: "",
        employmentType: "Full-time",
        location: "",
        jobDescription: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      });
    }
  }, [experience, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        return api.put(`/experience/${experience.EXPERIENCE_ID}`, data);
      } else {
        return api.post("/experience", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience", userId] });
      toast.success(isEdit ? "Experience updated!" : "Experience added!");
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
          <DialogTitle>{isEdit ? "Edit Experience" : "Add Experience"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="employmentType">Employment Type *</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., New York, NY"
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
                disabled={formData.isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCurrent"
              checked={formData.isCurrent}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isCurrent: checked as boolean, endDate: "" })
              }
            />
            <Label htmlFor="isCurrent" className="cursor-pointer">
              I currently work here
            </Label>
          </div>

          <div>
            <Label htmlFor="jobDescription">Description</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              placeholder="Describe your responsibilities and achievements..."
              rows={5}
            />
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

export default ExperienceModal;

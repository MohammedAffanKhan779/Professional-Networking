import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface EducationModalProps {
  open: boolean;
  onClose: () => void;
  education?: any;
  userId: string;
}

const EducationModal = ({ open, onClose, education, userId }: EducationModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!education;

  const [formData, setFormData] = useState({
    institutionName: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    if (education) {
      setFormData({
        institutionName: education.INSTITUTION_NAME || "",
        degree: education.DEGREE || "",
        fieldOfStudy: education.FIELD_OF_STUDY || "",
        startDate: education.START_DATE?.split("T")[0] || "",
        endDate: education.END_DATE?.split("T")[0] || "",
        description: education.DESCRIPTION || "",
      });
    } else {
      setFormData({
        institutionName: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  }, [education, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        return api.put(`/education/${education.EDUCATION_ID}`, data);
      } else {
        return api.post("/education", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education", userId] });
      toast.success(isEdit ? "Education updated!" : "Education added!");
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
          <DialogTitle>{isEdit ? "Edit Education" : "Add Education"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="institutionName">Institution Name *</Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="degree">Degree *</Label>
            <Input
              id="degree"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="e.g., Bachelor's, Master's, PhD"
              required
            />
          </div>

          <div>
            <Label htmlFor="fieldOfStudy">Field of Study</Label>
            <Input
              id="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
              placeholder="e.g., Computer Science"
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
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your achievements, GPA, relevant coursework..."
              rows={4}
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

export default EducationModal;

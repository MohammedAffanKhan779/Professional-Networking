import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface SkillModalProps {
  open: boolean;
  onClose: () => void;
  skill?: any;
  userId: string;
}

const SkillModal = ({ open, onClose, skill, userId }: SkillModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!skill;

  const [formData, setFormData] = useState({
    skill: "",
    proficiencyLevel: "Intermediate",
  });

  useEffect(() => {
    if (skill) {
      setFormData({
        skill: skill.SKILL || "",
        proficiencyLevel: skill.PROFICIENCY_LVL || "Intermediate",
      });
    } else {
      setFormData({
        skill: "",
        proficiencyLevel: "Intermediate",
      });
    }
  }, [skill, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        return api.put(`/skills/${skill.SKILL_ID}`, data);
      } else {
        return api.post("/skills", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", userId] });
      toast.success(isEdit ? "Skill updated!" : "Skill added!");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="skill">Skill Name *</Label>
            <Input
              id="skill"
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              placeholder="e.g., JavaScript, Python, React"
              required
            />
          </div>

          <div>
            <Label htmlFor="proficiencyLevel">Proficiency Level *</Label>
            <Select
              value={formData.proficiencyLevel}
              onValueChange={(value) => setFormData({ ...formData, proficiencyLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
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

export default SkillModal;

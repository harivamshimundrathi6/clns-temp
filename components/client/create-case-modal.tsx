"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createClientCase } from "@/app/actions/client";
import { useRouter } from "next/navigation";

export function CreateCaseModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        type: "Consultation",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.type) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const result = await createClientCase(formData);

            if (result.success) {
                toast.success("Case created successfully");
                setOpen(false);
                setFormData({ title: "", type: "Consultation", description: "" });
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create case");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-500 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Case
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0f172a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Add a new legal matter to your profile so advocates can review it.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-300">Case Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g. Property Dispute" 
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-slate-300">Case Type</Label>
                        <select 
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="Consultation">Consultation</option>
                            <option value="Civil">Civil</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Family">Family</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300">Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Briefly describe your legal issue..." 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            required
                        />
                    </div>
                    
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-500 text-white">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Case
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

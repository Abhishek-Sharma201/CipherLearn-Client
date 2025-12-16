"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useUpdateProfileMutation } from "@/redux/slices/auth/authApi"
import { useAppDispatch } from "@/redux/hooks"
import { setCredentials } from "@/redux/slices/auth/authSlice"
import { toast } from "sonner"

interface EditProfileDialogProps {
    user: {
        name: string
        email: string
        role: string
    } | null
}

export function EditProfileDialog({ user }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false)
    const [updateProfile, { isLoading }] = useUpdateProfileMutation()
    const dispatch = useAppDispatch()

    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await updateProfile({ name, email }).unwrap()
            
            // Update Redux store and localStorage
            dispatch(setCredentials({
                user: result.user,
                token: localStorage.getItem('token') || "" // Keep existing token
            }))

            toast.success("Profile updated successfully")
            setOpen(false)
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update profile")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

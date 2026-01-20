"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
} from "lucide-react";
import { signOut } from "next-auth/react";

import useUser from "@/lib/users/useUser";
import {
  profileUpdateSchema,
  ProfileUpdateValues,
} from "@/lib/validations/profile.schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { S3Uploader } from "@/components/ui/s3-uploader";

const DELETE_CONFIRMATION_TEXT = "delete my account";

const dataToBeDeleted = [
  { label: "All your reviews and review data", deleted: true },
  { label: "Email alert settings", deleted: true },
  { label: "Connected integrations (Google)", deleted: true },
  { label: "Profile information", deleted: true },
  { label: "Subscription (if active, will be cancelled)", deleted: true },
];

export default function ProfileSettingsPage() {
  const { user, isLoading, mutate } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      image: user?.image || null,
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        image: user.image || null,
      });
      setAvatarUrl(user.image || "");
    }
  }, [user, form]);

  const handleAvatarUpload = async (fileUrls: string[]) => {
    if (fileUrls.length > 0) {
      const uploadedUrl = fileUrls[0];
      setAvatarUrl(uploadedUrl);
      form.setValue("image", uploadedUrl);
    }
  };

  const onSubmit = async (data: ProfileUpdateValues) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/app/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      await mutate();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== DELETE_CONFIRMATION_TEXT) {
      toast.error("Please enter the correct confirmation text");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/app/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      toast.success(
        "Account deletion requested. You will be signed out shortly."
      );
      setDeleteDialogOpen(false);
      await signOut({ callbackUrl: "/sign-in" });
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isDeleting) {
      setDeleteDialogOpen(open);
      if (!open) {
        setDeleteConfirmation("");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const displayAvatarUrl = avatarUrl || user?.image || "";
  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const canDelete = deleteConfirmation === DELETE_CONFIRMATION_TEXT;

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={displayAvatarUrl}
                      alt={user?.name || "Profile"}
                    />
                    <AvatarFallback className="text-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <S3Uploader
                      presignedRouteProvider="/api/app/me/upload-avatar"
                      variant="button"
                      onUpload={handleAvatarUpload}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024}
                      buttonText="Change Avatar"
                      buttonVariant="outline"
                      buttonSize="sm"
                      className="w-fit"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and membership information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Member Since</span>
            <span className="text-sm text-muted-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Account ID</span>
            <span className="text-sm text-muted-foreground font-mono text-xs">
              {user?.id || "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This
                  action cannot be undone after the grace period.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <AlertDialog open={deleteDialogOpen} onOpenChange={handleDialogClose}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Your Account?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      This will permanently delete your account and all
                      associated data.
                    </p>

                    {/* Grace Period Notice */}
                    <div className="flex items-start gap-3 rounded-lg border bg-amber-500/10 border-amber-500/30 p-3">
                      <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-600">
                          30-Day Grace Period
                        </p>
                        <p className="text-sm text-muted-foreground">
                          You&apos;ll be signed out immediately, but your data
                          will be retained for 30 days. Contact support within
                          this period to recover your account.
                        </p>
                      </div>
                    </div>

                    {/* What will be deleted */}
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium mb-2">
                        Data that will be deleted:
                      </p>
                      <ul className="space-y-1.5">
                        {dataToBeDeleted.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            {item.deleted ? (
                              <XCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Email Notice */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>
                        A confirmation email will be sent to {user?.email}
                      </span>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirmation" className="text-sm">
                        Type{" "}
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                          {DELETE_CONFIRMATION_TEXT}
                        </span>{" "}
                        to confirm:
                      </Label>
                      <Input
                        id="delete-confirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={DELETE_CONFIRMATION_TEXT}
                        className={
                          canDelete
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={!canDelete || isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Yes, Delete My Account
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}

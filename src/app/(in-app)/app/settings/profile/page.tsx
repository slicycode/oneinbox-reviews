"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User, Save } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export default function ProfileSettingsPage() {
  const { user, isLoading, mutate } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteConfirmationText = "delete my account";

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== deleteConfirmationText) {
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

      toast.success("Account deletion requested");
      await signOut({ callbackUrl: "/sign-in" });
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
      setIsDeleting(false);
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
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertTitle>Delete Account</AlertTitle>
            <AlertDescription>
              This action cannot be undone. Your access will be revoked
              immediately and all your data will be permanently deleted.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Label>
              Type &quot;{deleteConfirmationText}&quot; to confirm
            </Label>
            <Input
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder={deleteConfirmationText}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={
              isDeleting || deleteConfirmation !== deleteConfirmationText
            }
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

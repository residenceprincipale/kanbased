import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useAuthData} from "@/queries/session";
import {
  useUpdateUserMutation,
  useUploadUserImageMutation,
} from "@/queries/user";
import {Spinner} from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UserSettings(props: {onClose: () => void}) {
  const userData = useAuthData();
  const defaultUserImage = userData.image;
  const [previewUrl, setPreviewUrl] = useState(defaultUserImage);
  const uploadImageMutation = useUploadUserImageMutation();
  const updateUserMutation = useUpdateUserMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");

    updateUserMutation.mutate(
      {
        name: name as string,
        image: previewUrl,
      },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
        },
      },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous preview URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    uploadImageMutation.mutate(
      {file},
      {
        onSuccess: ({imageUrl}) => {
          setPreviewUrl(imageUrl);
        },
        onError: () => {
          setPreviewUrl(defaultUserImage);
        },
        onSettled: () => {
          URL.revokeObjectURL(url);
        },
      },
    );
  };

  const handleCancel = () => {
    setPreviewUrl(defaultUserImage);
    props.onClose();
  };

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>Manage your user settings</DialogDescription>
        </DialogHeader>
        <div className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="avatar" className="mb-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl} alt="Profile picture" />
                    <AvatarFallback>
                      {userData.name[0]} {userData.name[1]}
                    </AvatarFallback>
                  </Avatar>
                </Label>

                <div className="flex flex-col">
                  <Label htmlFor="avatar" className="mb-2">
                    Profile Picture
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full"
                    disabled={
                      uploadImageMutation.isPending ||
                      updateUserMutation.isPending
                    }
                  />

                  {uploadImageMutation.isPending && (
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Spinner />
                      <p className="text-xs text-gray-500">
                        Uploading profile picture...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  defaultValue={userData.email}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={userData.name}
                  placeholder="Jon Snow"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                disabled={
                  uploadImageMutation.isPending || updateUserMutation.isPending
                }
                type="submit"
              >
                {updateUserMutation.isPending && <Spinner />}
                Save
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

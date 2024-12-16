import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routeMap } from "@/lib/constants";
import { useState, type FormEventHandler } from "react";
import { fetchClient } from "@/lib/fetch-client";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import type { paths } from "@/types/api-schema";

export const Route = createFileRoute("/auth/login")({
  component: LoginForm,
});

type ApiRouteUrls<TPaths extends keyof paths> = `${string}${TPaths}`;
const googleLoginUrl: ApiRouteUrls<"/auth/login/google"> = `${
  import.meta.env.CLIENT_MY_API_BASE_URL
}/auth/login/google`;

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    setIsSubmitting(true);
    const { error } = await fetchClient.POST("/auth/login/email", {
      body: {
        email,
        password,
      },
    });
    setIsSubmitting(false);

    console.log("hello");

    if (error) {
      // toast(error.message);
    } else {
      navigate({ to: "/" });
    }
  };

  if (true) {
    // TODO: For now just use google auth.
    return (
      <div className="h-screen flex justify-center items-center">
        <a href={googleLoginUrl} className={cn(buttonVariants(), "gap-2")}>
          {/* <GoogleIcon /> */}
          <GoogleIcon />
          Sign in with Google
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-screen flex justify-center items-center"
    >
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {/* <Link ="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link> */}
              </div>
              <Input name="password" id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full gap-2">
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to={routeMap.register} className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      className="w-6 h-6"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

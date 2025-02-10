"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/auth/login")({
  component: SignIn,
});

function SignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isEmailLoginLoading, setIsEmailLoginLoading] = useState(false);
  const router = useRouter();

  const handleUserPasswordLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsEmailLoginLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          router.navigate({ to: "/" });
        },
      }
    );
    setIsEmailLoginLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: window.location.origin,
      },
      {
        onSuccess: () => {
          router.navigate({ to: "/" });
        },
      }
    );
    setIsGoogleLoading(false);
  };

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: window.location.origin,
      },
      {
        onSuccess: () => {
          router.navigate({ to: "/" });
        },
      }
    );
    setIsGithubLoading(false);
  };

  return (
    <form
      className="w-full h-svh flex items-center justify-center"
      onSubmit={handleUserPasswordLogin}
    >
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
          <CardDescription className="text-xs md:text-sm">
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
                <Link
                  to="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="password"
                autoComplete="password"
                name="password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isEmailLoginLoading}
            >
              {isEmailLoginLoading ? <Spinner /> : "Login"}
            </Button>
          </div>

          <Link
            to="/auth/register"
            className={buttonVariants({
              variant: "link",
              className: "text-left pl-0 w-fit my-2.5",
            })}
          >
            Don't have an account? Sign up
          </Link>
          <div
            className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col"
            )}
          >
            <Button
              variant="outline"
              className={cn("w-full gap-2")}
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? <Spinner /> : <GoogleIcon />}
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              className={cn("w-full gap-2")}
              type="button"
              onClick={handleGithubLogin}
              disabled={isGithubLoading}
            >
              {isGithubLoading ? <Spinner /> : <GithubIcon />}
              Sign in with Github
            </Button>
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

function GithubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
      ></path>
    </svg>
  );
}

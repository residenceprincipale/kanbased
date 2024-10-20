"use client";
import Link from "next/link";

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
import { useRouter } from "next/navigation";
import { fetchClient } from "@/lib/fetch-client";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import type { paths } from "@/types/api-schema";

const googleLoginUrl: `${string}${keyof paths}` = `${process.env.NEXT_PUBLIC_API_URL}/auth/login/google`;

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

    if (error) {
      toast(error.message);
    } else {
      router.push(routeMap.home);
    }
  };
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
                {/* <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
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

            <Link
              href={googleLoginUrl}
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                "w-full"
              )}
            >
              Sign in with Google
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href={routeMap.register} className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

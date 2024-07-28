import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Loader } from "~/components/ui/loader";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { usePostMutation } from "~/lib/mutation-client";

export default function Login() {
  const navigate = useNavigate();
  const loginMutation = usePostMutation("/auth/login/email");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    loginMutation.mutate(
      {
        body: {
          password,
          email,
        },
      },
      {
        onSuccess() {
          navigate("/");
        },
      }
    );
  };

  return (
    <div class="h-screen w-full flex items-center">
      <form onSubmit={handleSubmit} class="mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <TextField class="space-y-1">
              <TextFieldLabel>Email</TextFieldLabel>
              <TextFieldInput
                type="email"
                placeholder="me@email.com"
                required
                name="email"
              />
            </TextField>

            <TextField class="space-y-1">
              <TextFieldLabel>Password</TextFieldLabel>
              <TextFieldInput
                type="password"
                placeholder=""
                required
                name="password"
              />
            </TextField>
          </CardContent>

          <CardFooter>
            <Button class="w-full" type="submit">
              <Show when={loginMutation.isPending}>
                <Loader /> Logging in
              </Show>
              <Show when={!loginMutation.isPending}>Login</Show>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

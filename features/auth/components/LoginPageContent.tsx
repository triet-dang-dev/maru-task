"use client";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowLeft, Building2, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { apiV1Path } from "@/utils/api-path";

import { buildAzureSignInUrl } from "../azure";
import { loginWithEmail, navigateToAuthenticatedPath, startOidcSignIn } from "../service";

type LoginFormValues = {
  email: string;
  password: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPageContent() {
  const { error: toastError, success } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const startAzureSignIn = async () => {
    try {
      setIsSubmitting(true);
      await startOidcSignIn(buildAzureSignInUrl());
    } catch (oidcError) {
      toastError(
        `${oidcError instanceof Error ? oidcError.message : "Unable to start Microsoft sign-in."}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEmailSignIn = () => {
    setShowEmailForm(true);
  };

  const submit = async ({ email, password }: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await loginWithEmail({ email: email.trim(), password });
      const nextPath = searchParams.get("next");
      success("Signed in successfully.");
      navigateToAuthenticatedPath(nextPath && nextPath.startsWith("/") ? nextPath : "/");
    } catch (loginError) {
      toastError(`${loginError instanceof Error ? loginError.message : "Unable to sign in."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--mui-palette-background-default)] px-4 py-12">
      <Paper
        component="section"
        sx={{ maxWidth: 420, p: { xs: 5, sm: 6 }, width: "100%" }}
        variant="outlined"
      >
        <Stack spacing={4}>
          <div>
            <Typography color="primary.main" sx={{ fontWeight: 600 }} variant="body2">
              Maru Task
            </Typography>
            <Typography component="h1" sx={{ mt: 1 }} variant="h2">
              {showEmailForm ? "Sign in with email" : "Welcome back"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              {showEmailForm
                ? "Enter your account details to continue."
                : "Choose how you want to sign in."}
            </Typography>
          </div>
          {showEmailForm ? (
            <Stack component="form" noValidate onSubmit={handleSubmit(submit)} spacing={3}>
              <InputField
                autoComplete="email"
                control={control}
                label="Email"
                name="email"
                rules={{
                  validate: (value) => {
                    const normalizedEmail = value.trim();
                    if (!normalizedEmail) return "Email is required.";
                    return emailPattern.test(normalizedEmail) || "Enter a valid email address.";
                  },
                }}
                type="email"
              />
              <InputField
                autoComplete="current-password"
                control={control}
                label="Password"
                name="password"
                rules={{ required: "Password is required." }}
                type="password"
              />
              <Button isLoading={isSubmitting} type="submit">
                Sign in
              </Button>
              <Button
                onClick={() => setShowEmailForm(false)}
                startIcon={<ArrowLeft aria-hidden="true" size={18} />}
                type="button"
                variant="text"
              >
                Choose another method
              </Button>
              {process.env.NEXT_PUBLIC_APP_ENV === "development" ? (
                <Button color="secondary" href={apiV1Path("/auth/dev-login")} variant="outline">
                  Quick dev login
                </Button>
              ) : null}
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Button
                isLoading={isSubmitting}
                onClick={startAzureSignIn}
                startIcon={<Building2 aria-hidden="true" size={20} />}
                sx={{ justifyContent: "flex-start", minHeight: 52 }}
                type="button"
              >
                Sign in with Microsoft
              </Button>
              <Button
                onClick={openEmailSignIn}
                startIcon={<Mail aria-hidden="true" size={20} />}
                sx={{ justifyContent: "flex-start", minHeight: 52 }}
                type="button"
                variant="outline"
              >
                Sign in with email
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </main>
  );
}

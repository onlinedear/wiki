import * as z from "zod";
import { useForm, zodResolver } from "@mantine/form";
import { IRegister } from "@/features/auth/types/auth.types";
import {
  Container,
  Title,
  TextInput,
  Button,
  PasswordInput,
  Box,
  Anchor,
  Text,
} from "@mantine/core";
import classes from "./auth.module.css";
import { useRedirectIfAuthenticated } from "@/features/auth/hooks/use-redirect-if-authenticated.ts";
import { Link } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";
import { useTranslation } from "react-i18next";
import { useWorkspacePublicDataQuery } from "@/features/workspace/queries/workspace-query.ts";
import { Error404 } from "@/components/ui/error-404.tsx";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/features/auth/services/auth-service.ts";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useRedirectIfAuthenticated();
  const {
    data,
    isLoading: isDataLoading,
    isError,
    error,
  } = useWorkspacePublicDataQuery();

  const form = useForm<IRegister>({
    validate: zodResolver(formSchema),
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: IRegister) => AuthService.register(data),
    onSuccess: () => {
      window.location.href = APP_ROUTE.HOME;
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Registration failed. Please try again.";
      notifications.show({
        color: "red",
        message: message,
      });
    },
  });

  async function onSubmit(data: IRegister) {
    await registerMutation.mutateAsync(data);
  }

  if (isDataLoading) {
    return null;
  }

  if (isError && error?.["response"]?.status === 404) {
    return <Error404 />;
  }

  if (data?.enforceSso) {
    return (
      <Container size={420} className={classes.container}>
        <Box p="xl" className={classes.containerBox}>
          <Title order={2} ta="center" fw={500} mb="md">
            {t("Registration Disabled")}
          </Title>
          <Text ta="center" c="dimmed">
            {t("Registration is disabled when SSO is enforced.")}
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container size={420} className={classes.container}>
      <Box p="xl" className={classes.containerBox}>
        <Title order={2} ta="center" fw={500} mb="md">
          {t("Register")}
        </Title>

        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            id="name"
            type="text"
            label={t("Name")}
            placeholder={t("Your name")}
            variant="filled"
            {...form.getInputProps("name")}
          />

          <TextInput
            id="email"
            type="email"
            label={t("Email")}
            placeholder="email@example.com"
            variant="filled"
            mt="md"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label={t("Password")}
            placeholder={t("Your password")}
            variant="filled"
            mt="md"
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label={t("Confirm Password")}
            placeholder={t("Confirm your password")}
            variant="filled"
            mt="md"
            {...form.getInputProps("confirmPassword")}
          />

          <Button
            type="submit"
            fullWidth
            mt="xl"
            loading={registerMutation.isPending}
          >
            {t("Register")}
          </Button>
        </form>

        <Text ta="center" mt="md" size="sm">
          {t("Already have an account?")}{" "}
          <Anchor to={APP_ROUTE.AUTH.LOGIN} component={Link} underline="never">
            {t("Sign In")}
          </Anchor>
        </Text>
      </Box>
    </Container>
  );
}

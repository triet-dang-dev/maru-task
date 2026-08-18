import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginWithEmail, navigateToAuthenticatedPath, startOidcSignIn } from "../service";
import { ToastProvider } from "@/components/ui/Toast";
import { LoginPageContent } from "./LoginPageContent";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
const { getNextPath } = vi.hoisted(() => ({ getNextPath: vi.fn() }));

function renderLoginPage() {
  return render(
    <ToastProvider>
      <LoginPageContent />
    </ToastProvider>,
  );
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: getNextPath }),
}));
vi.mock("../azure", () => ({ buildAzureSignInUrl: () => "#azure-sign-in" }));
vi.mock("../service", () => ({
  loginWithEmail: vi.fn(),
  navigateToAuthenticatedPath: vi.fn(),
  startOidcSignIn: vi.fn(),
}));

describe("LoginPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getNextPath.mockReturnValue(null);
  });

  it("shows a loading state while Microsoft sign-in starts", async () => {
    const user = userEvent.setup();
    vi.mocked(startOidcSignIn).mockReturnValue(new Promise(() => undefined));

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Sign in with Microsoft" }));

    expect(screen.getByRole("button", { name: "Sign in with Microsoft" })).toBeDisabled();
    expect(screen.getByTestId("button-loading-icon")).toBeInTheDocument();
  });

  it("shows a toast when the OIDC start endpoint is unavailable", async () => {
    const user = userEvent.setup();
    vi.mocked(startOidcSignIn).mockRejectedValue(
      new Error("The authentication service is unavailable."),
    );

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Sign in with Microsoft" }));

    expect(
      await screen.findByText("The authentication service is unavailable."),
    ).toBeInTheDocument();
  });

  it("reveals the email form only after the user selects email sign-in", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows an email validation error without requesting login", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "not-a-real-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(loginWithEmail).not.toHaveBeenCalled();
  });

  it("submits validated credentials and navigates to the workspace after the session cookie is set", async () => {
    const user = userEvent.setup();
    vi.mocked(loginWithEmail).mockResolvedValue(undefined);

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));
    await user.type(screen.getByLabelText("Email"), "morgan@example.com");
    await user.type(screen.getByLabelText("Password"), "not-a-real-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith({
        email: "morgan@example.com",
        password: "not-a-real-password",
      });
      expect(navigateToAuthenticatedPath).toHaveBeenCalledWith("/");
      expect(replace).not.toHaveBeenCalled();
    });
  });

  it("redirects to the original protected path after successful login", async () => {
    const user = userEvent.setup();
    vi.mocked(loginWithEmail).mockResolvedValue(undefined);
    getNextPath.mockReturnValue("/projects/42");

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));
    await user.type(screen.getByLabelText("Email"), "morgan@example.com");
    await user.type(screen.getByLabelText("Password"), "not-a-real-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(navigateToAuthenticatedPath).toHaveBeenCalledWith("/projects/42");
    });
  });
});

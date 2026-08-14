import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginWithEmail } from "../service";
import { LoginPageContent } from "./LoginPageContent";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
const { getNextPath } = vi.hoisted(() => ({ getNextPath: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: getNextPath }),
}));
vi.mock("../service", () => ({ loginWithEmail: vi.fn() }));

describe("LoginPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getNextPath.mockReturnValue(null);
  });

  it("reveals the email form only after the user selects email sign-in", async () => {
    const user = userEvent.setup();

    render(<LoginPageContent />);

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows an email validation error without requesting login", async () => {
    const user = userEvent.setup();

    render(<LoginPageContent />);

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

    render(<LoginPageContent />);

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));
    await user.type(screen.getByLabelText("Email"), "morgan@example.com");
    await user.type(screen.getByLabelText("Password"), "not-a-real-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith({
        email: "morgan@example.com",
        password: "not-a-real-password",
      });
      expect(replace).toHaveBeenCalledWith("/");
    });
  });

  it("redirects to the original protected path after successful login", async () => {
    const user = userEvent.setup();
    vi.mocked(loginWithEmail).mockResolvedValue(undefined);
    getNextPath.mockReturnValue("/projects/42");

    render(<LoginPageContent />);

    await user.click(screen.getByRole("button", { name: "Sign in with email" }));
    await user.type(screen.getByLabelText("Email"), "morgan@example.com");
    await user.type(screen.getByLabelText("Password"), "not-a-real-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/projects/42");
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

describe("Tabs", () => {
  it("associates tabs with panels and supports uncontrolled selection", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="overview">
        <TabList aria-label="Workspace views">
          <Tab label="Overview" value="overview" />
          <Tab label="Activity" value="activity" />
        </TabList>
        <TabPanel value="overview">Overview content</TabPanel>
        <TabPanel value="activity">Activity content</TabPanel>
      </Tabs>,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const activityTab = screen.getByRole("tab", { name: "Activity" });

    expect(overviewTab).toHaveAttribute("aria-controls");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview content");

    await user.click(activityTab);

    expect(activityTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity content");
  });

  it("supports controlled values and keyboard focus navigation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Tabs onValueChange={onValueChange} value="overview">
        <TabList aria-label="Report views">
          <Tab label="Overview" value="overview" />
          <Tab label="Details" value="details" />
        </TabList>
        <TabPanel value="overview">Overview report</TabPanel>
        <TabPanel value="details">Detailed report</TabPanel>
      </Tabs>,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });

    overviewTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(detailsTab).toHaveFocus();

    await user.click(detailsTab);
    expect(onValueChange).toHaveBeenCalledWith("details");
  });
});

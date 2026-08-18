import { describe, expect, it } from "vitest";

import { missingNavigationPages, navigationTree } from "./navigation-tree";

function findItem(label: string) {
  const item = navigationTree.find((candidate) => candidate.label === label);
  if (!item) throw new Error(`Expected navigation item \"${label}\".`);
  return item;
}

describe("navigationTree", () => {
  it("defines the complete OpenProject primary navigation model", () => {
    expect(navigationTree.map((item) => item.label)).toEqual([
      "Home",
      "My page",
      "My time tracking",
      "Portfolios",
      "Projects",
      "Work packages",
      "Gantt charts",
      "Boards",
      "Meetings",
      "News",
      "Time and costs",
      "Wiki",
      "Requirements",
    ]);
  });

  it("uses implemented project routes and leaves unavailable saved views unlinked", () => {
    expect(findItem("Projects").children?.map((item) => item.href)).toEqual([
      "/projects",
      "/projects?view=mine",
      "/projects?view=favorites",
      "/projects?view=archived",
      undefined,
    ]);
    expect(findItem("Work packages").children?.[0].children?.map((item) => item.href)).toEqual([
      "/projects/:projectId/work-items",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(findItem("Gantt charts").children?.[0].children?.map((item) => item.href)).toEqual([
      "/projects/:projectId/gantt",
      undefined,
    ]);
  });

  it("groups project health and meeting involvement below their parent menus", () => {
    expect(findItem("Projects").children?.[4].children?.map((item) => item.href)).toEqual([
      "/projects?status=on-track",
      "/projects?status=off-track",
      "/projects?status=at-risk",
    ]);
    expect(findItem("Meetings").children?.[4].children?.map((item) => item.href)).toEqual([
      undefined,
      undefined,
    ]);
  });

  it("maps implemented menu items to existing application routes", () => {
    expect(findItem("Home").href).toBe("/home");
    expect(findItem("My page").href).toBe("/my/page");
    expect(
      findItem("Projects")
        .children?.slice(0, 4)
        .map((item) => item.href),
    ).toEqual([
      "/projects",
      "/projects?view=mine",
      "/projects?view=favorites",
      "/projects?view=archived",
    ]);
    expect(findItem("Work packages").children?.[0].children?.[0].href).toBe(
      "/projects/:projectId/work-items",
    );
    expect(findItem("Gantt charts").children?.[0].children?.[0].href).toBe(
      "/projects/:projectId/gantt",
    );
    expect(findItem("Boards").href).toBe("/projects/:projectId/boards");
    expect(findItem("Time and costs").href).toBe("/projects/:projectId/reports/time-cost");
    expect(findItem("Wiki").children?.[1].href).toBe("/projects/:projectId/wiki");
  });

  it("records target pages that do not yet exist", () => {
    expect(missingNavigationPages.map((page) => page.label)).toEqual(
      expect.arrayContaining([
        "My time tracking",
        "Portfolios",
        "Latest activity",
        "Milestones",
        "Meetings",
        "News",
        "Requirements",
      ]),
    );
  });
});

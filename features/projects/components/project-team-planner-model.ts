export type TeamPlannerView = "workWeek" | "week" | "twoWeeks" | "fourWeeks" | "eightWeeks";

export interface TeamPlannerWorkPackage {
  dueDate: string;
  id: string;
  startDate: string;
  status: string;
  subject: string;
  type: string;
}

export interface TeamPlannerAssignee {
  id: string;
  initials: string;
  name: string;
  workPackages: TeamPlannerWorkPackage[];
}

export const plannerViewOptions: Array<{
  dayCount: number;
  incrementDays: number;
  label: string;
  value: TeamPlannerView;
  workDaysOnly?: boolean;
}> = [
  { dayCount: 5, incrementDays: 7, label: "Work week", value: "workWeek", workDaysOnly: true },
  { dayCount: 7, incrementDays: 7, label: "1-week", value: "week" },
  { dayCount: 14, incrementDays: 7, label: "2-week", value: "twoWeeks" },
  { dayCount: 28, incrementDays: 14, label: "4-week", value: "fourWeeks" },
  { dayCount: 56, incrementDays: 28, label: "8-week", value: "eightWeeks" },
];

export const defaultTeamPlannerAssignees: TeamPlannerAssignee[] = [
  {
    id: "riley",
    initials: "RP",
    name: "Riley Park",
    workPackages: [
      {
        dueDate: "2026-08-19",
        id: "138",
        startDate: "2026-08-17",
        status: "In progress",
        subject: "Confirm project stakeholder access",
        type: "Task",
      },
    ],
  },
  {
    id: "dana",
    initials: "DC",
    name: "Dana Chen",
    workPackages: [
      {
        dueDate: "2026-08-20",
        id: "142",
        startDate: "2026-08-18",
        status: "In progress",
        subject: "Review the release checklist",
        type: "Task",
      },
    ],
  },
  {
    id: "morgan",
    initials: "MT",
    name: "Morgan Tate",
    workPackages: [
      {
        dueDate: "2026-08-21",
        id: "145",
        startDate: "2026-08-20",
        status: "Open",
        subject: "Verify the project data import",
        type: "Task",
      },
    ],
  },
];

export const defaultUnscheduledWorkPackages: TeamPlannerWorkPackage[] = [
  {
    dueDate: "",
    id: "151",
    startDate: "",
    status: "Open",
    subject: "Confirm incident response owners",
    type: "Task",
  },
  {
    dueDate: "",
    id: "144",
    startDate: "",
    status: "Open",
    subject: "Prepare customer onboarding notes",
    type: "Task",
  },
];

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getUTCDay();
  result.setUTCDate(result.getUTCDate() - (day === 0 ? 6 : day - 1));
  return result;
}

export function getPlannerDays(anchorDate: Date, view: TeamPlannerView) {
  const option = plannerViewOptions.find((candidate) => candidate.value === view)!;
  const start = startOfWeek(anchorDate);
  const days: Date[] = [];

  for (let offset = 0; days.length < option.dayCount; offset += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + offset);
    if (!option.workDaysOnly || (day.getUTCDay() !== 0 && day.getUTCDay() !== 6)) days.push(day);
  }

  return days;
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatPlannerRange(days: Date[]) {
  const first = days[0];
  const last = days.at(-1);
  if (!first || !last) return "";

  const monthDay = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const fullDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });

  if (first.getUTCFullYear() !== last.getUTCFullYear()) {
    return `${fullDate.format(first)} – ${fullDate.format(last)}`;
  }
  if (first.getUTCMonth() !== last.getUTCMonth()) {
    return `${monthDay.format(first)} – ${monthDay.format(last)}, ${last.getUTCFullYear()}`;
  }
  return `${monthDay.format(first)} – ${last.getUTCDate()}, ${last.getUTCFullYear()}`;
}

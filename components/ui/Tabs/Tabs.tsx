"use client";

import MuiTab, { type TabProps as MuiTabProps } from "@mui/material/Tab";
import MuiTabs, { type TabsProps as MuiTabsProps } from "@mui/material/Tabs";
import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";

import { cn } from "@/utils/cn";

interface TabsContextValue {
  baseId: string;
  onValueChange: (value: string) => void;
  value: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be rendered inside <Tabs>.");
  }

  return context;
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

export function Tabs({
  children,
  className,
  defaultValue = "",
  onValueChange,
  value: controlledValue,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const baseId = useId();
  const value = controlledValue ?? uncontrolledValue;

  const handleValueChange = (nextValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ baseId, onValueChange: handleValueChange, value }}>
      <div className={cn("min-w-0", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabListProps = Omit<MuiTabsProps, "onChange" | "value">;

export function TabList(props: TabListProps) {
  const { onValueChange, value } = useTabsContext();

  return (
    <MuiTabs
      {...props}
      onChange={(_, nextValue: string) => onValueChange(nextValue)}
      value={value}
    />
  );
}

export interface TabProps extends Omit<MuiTabProps, "value"> {
  value: string;
}

export function Tab({ value, ...props }: TabProps) {
  const { baseId } = useTabsContext();

  return (
    <MuiTab
      {...props}
      aria-controls={`${baseId}-panel-${value}`}
      id={`${baseId}-tab-${value}`}
      value={value}
    />
  );
}

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
  children: ReactNode;
  value: string;
}

export function TabPanel({ children, className, value, ...props }: TabPanelProps) {
  const { baseId, value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <div
      {...props}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={cn("py-4", className)}
      hidden={!isSelected}
      id={`${baseId}-panel-${value}`}
      role="tabpanel"
      tabIndex={0}
    >
      {isSelected ? children : null}
    </div>
  );
}

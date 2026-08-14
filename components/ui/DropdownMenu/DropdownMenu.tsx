"use client";

import Divider, { type DividerProps } from "@mui/material/Divider";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MuiMenuItem, { type MenuItemProps } from "@mui/material/MenuItem";
import { MoreHorizontal } from "lucide-react";
import {
  cloneElement,
  createContext,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";

import { IconButton } from "@/components/ui/IconButton";

interface TriggerProps {
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu";
  onClick?: MouseEventHandler<HTMLElement>;
}

export interface DropdownMenuProps extends Omit<
  MenuProps,
  "anchorEl" | "children" | "onClose" | "open"
> {
  children: ReactNode;
  trigger: ReactElement<TriggerProps>;
}

const DropdownMenuContext = createContext<(() => void) | null>(null);

export function DropdownMenu({ children, trigger, ...props }: DropdownMenuProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const isOpen = Boolean(anchorElement);

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    trigger.props.onClick?.(event);

    if (!event.defaultPrevented) {
      setAnchorElement(event.currentTarget);
    }
  };

  const closeMenu = () => setAnchorElement(null);

  return (
    <>
      {cloneElement(trigger, {
        "aria-controls": isOpen ? menuId : undefined,
        "aria-expanded": isOpen || undefined,
        "aria-haspopup": "menu",
        onClick: handleTriggerClick,
      })}
      <DropdownMenuContext.Provider value={closeMenu}>
        <Menu {...props} anchorEl={anchorElement} id={menuId} onClose={closeMenu} open={isOpen}>
          {children}
        </Menu>
      </DropdownMenuContext.Provider>
    </>
  );
}

export interface DropdownMenuItemProps extends Omit<MenuItemProps, "onClick"> {
  destructive?: boolean;
  onSelect?: () => void;
}

export function DropdownMenuItem({
  destructive = false,
  onSelect,
  sx,
  ...props
}: DropdownMenuItemProps) {
  const closeMenu = useContext(DropdownMenuContext);

  return (
    <MuiMenuItem
      {...props}
      onClick={() => {
        onSelect?.();
        closeMenu?.();
      }}
      sx={[
        destructive ? { color: "error.main" } : {},
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}

export function DropdownMenuSeparator(props: DividerProps) {
  return <Divider {...props} />;
}

export interface ActionMenuProps extends Omit<DropdownMenuProps, "trigger"> {
  label?: string;
}

export function ActionMenu({ label = "More actions", ...props }: ActionMenuProps) {
  return (
    <DropdownMenu
      {...props}
      trigger={
        <IconButton aria-label={label} size="small">
          <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
        </IconButton>
      }
    />
  );
}

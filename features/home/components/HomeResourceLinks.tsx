"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  BookOpen,
  ExternalLink,
  FileCode,
  HelpCircle,
  Keyboard,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  SectionCard,
  SectionCardContent,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard";
import type { HomeResourceLinkItem } from "../types";

export interface HomeResourceLinksProps {
  links: HomeResourceLinkItem[];
}

function getResourceIcon(iconName: HomeResourceLinkItem["iconName"]): ReactNode {
  const iconProps = { className: "h-5 w-5", "aria-hidden": true };
  switch (iconName) {
    case "book-open":
      return <BookOpen {...iconProps} className="h-5 w-5 text-indigo-500" />;
    case "keyboard":
      return <Keyboard {...iconProps} className="h-5 w-5 text-emerald-500" />;
    case "help-circle":
      return <HelpCircle {...iconProps} className="h-5 w-5 text-blue-500" />;
    case "users":
      return <Users {...iconProps} className="h-5 w-5 text-purple-500" />;
    case "file-code":
      return <FileCode {...iconProps} className="h-5 w-5 text-amber-500" />;
    case "shield":
      return <Shield {...iconProps} className="h-5 w-5 text-rose-500" />;
    default:
      return <BookOpen {...iconProps} className="h-5 w-5 text-indigo-500" />;
  }
}

export function HomeResourceLinks({ links }: HomeResourceLinksProps) {
  return (
    <SectionCard
      aria-labelledby="resource-links-heading"
      component="section"
      data-testid="home-resource-links"
    >
      <SectionCardHeader>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <BookOpen aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-primary-main)]" />
          <SectionCardTitle id="resource-links-heading">
            Guides, Documentation & Community
          </SectionCardTitle>
        </Stack>
      </SectionCardHeader>

      <SectionCardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {links.map((link) => {
            const isExternal = link.external || link.href.startsWith("http");
            return (
              <Box
                className="group transition-all hover:border-[var(--mui-palette-primary-main)] hover:bg-[var(--mui-palette-action-hover)]"
                component={isExternal ? "a" : Link}
                href={link.href}
                key={link.title}
                rel={isExternal ? "noopener noreferrer" : undefined}
                sx={{
                  border: "1px solid var(--mui-palette-divider)",
                  borderRadius: 2,
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  p: 2.5,
                  textDecoration: "none",
                }}
                target={isExternal ? "_blank" : undefined}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box
                    sx={{
                      alignItems: "center",
                      bgcolor: "action.hover",
                      borderRadius: 1.5,
                      display: "flex",
                      height: 38,
                      justifyContent: "center",
                      width: 38,
                    }}
                  >
                    {getResourceIcon(link.iconName)}
                  </Box>
                  {isExternal ? (
                    <ExternalLink
                      aria-hidden="true"
                      className="h-4 w-4 text-[var(--mui-palette-text-secondary)] opacity-60 group-hover:opacity-100"
                    />
                  ) : null}
                </Stack>

                <Typography
                  sx={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    mt: 2,
                  }}
                  variant="subtitle2"
                >
                  {link.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: "0.8125rem",
                    mt: 0.5,
                    lineHeight: 1.4,
                  }}
                  variant="body2"
                >
                  {link.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </SectionCardContent>
    </SectionCard>
  );
}

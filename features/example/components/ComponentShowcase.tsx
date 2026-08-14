"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Bell, Pencil, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";

import { AutocompleteField } from "@/components/ui/AutocompleteField";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ActionMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { RadioGroupField } from "@/components/ui/RadioGroupField";
import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardFooter,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard";
import { SwitchField } from "@/components/ui/SwitchField";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

const people = ["Alex Morgan", "Jordan Lee", "Minh Tran", "Sam Rivera"];
const iconProps = { size: 18, strokeWidth: 1.8 } as const;

export function ComponentShowcase() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(2);
  const [showSuccessAlert, setShowSuccessAlert] = useState(true);

  return (
    <Box component="section" id="components">
      <Box sx={{ maxWidth: 720 }}>
        <Typography component="h2" variant="h2">
          Component library
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 3 }} variant="body1">
          Reusable navigation, feedback, form, loading, and action patterns rendered in the same
          dashboard where they will be used.
        </Typography>
      </Box>

      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 6,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", xl: "repeat(2, minmax(0, 1fr))" },
          mt: 7,
        }}
      >
        <SectionCard>
          <SectionCardHeader
            action={
              <IconButton aria-label="Component settings" size="small">
                <Settings2 aria-hidden="true" {...iconProps} />
              </IconButton>
            }
          >
            <Box>
              <SectionCardTitle component="h3">Navigation & actions</SectionCardTitle>
              <SectionCardDescription>
                Breadcrumbs, icon actions, menus, and destructive confirmation.
              </SectionCardDescription>
            </Box>
          </SectionCardHeader>
          <SectionCardContent>
            <Stack spacing={6}>
              <Breadcrumbs
                aria-label="Component example breadcrumbs"
                items={[
                  { href: "#foundation", label: "Foundation" },
                  { href: "#components", label: "Components" },
                  { label: "Actions" },
                ]}
              />
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 2 }}
              >
                <Button
                  color="error"
                  onClick={() => setConfirmOpen(true)}
                  startIcon={<Trash2 aria-hidden="true" {...iconProps} />}
                  variant="outline"
                >
                  Open confirmation dialog
                </Button>
                <IconButton aria-label="Notifications">
                  <Bell aria-hidden="true" {...iconProps} />
                </IconButton>
                <ActionMenu label="Open action menu">
                  <DropdownMenuItem>
                    <Pencil aria-hidden="true" className="mr-3 h-4 w-4" />
                    Edit record
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive>Delete record</DropdownMenuItem>
                </ActionMenu>
              </Stack>
            </Stack>
          </SectionCardContent>
          <SectionCardFooter>
            <Typography color="text.secondary" variant="caption">
              ActionMenu closes automatically after an item is selected.
            </Typography>
          </SectionCardFooter>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader>
            <Box>
              <SectionCardTitle component="h3">Tabs & inline feedback</SectionCardTitle>
              <SectionCardDescription>
                Local navigation paired with success, warning, and error messages.
              </SectionCardDescription>
            </Box>
          </SectionCardHeader>
          <SectionCardContent>
            <Tabs defaultValue="preview">
              <TabList aria-label="Component example tabs">
                <Tab label="Preview" value="preview" />
                <Tab label="Usage" value="usage" />
              </TabList>
              <TabPanel value="preview">
                <Stack spacing={3}>
                  {showSuccessAlert ? (
                    <InlineAlert
                      onDismiss={() => setShowSuccessAlert(false)}
                      title="Changes saved"
                      tone="success"
                    >
                      The workspace settings are up to date.
                    </InlineAlert>
                  ) : null}
                  <InlineAlert title="Review required" tone="warning">
                    Two records are waiting for approval.
                  </InlineAlert>
                  <InlineAlert title="Sync failed" tone="error">
                    Reconnect the integration before retrying.
                  </InlineAlert>
                </Stack>
              </TabPanel>
              <TabPanel value="usage">
                <Typography color="text.secondary" variant="body2">
                  Use composable primitives for product-specific workflows.
                </Typography>
              </TabPanel>
            </Tabs>
          </SectionCardContent>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader>
            <Box>
              <SectionCardTitle component="h3">Form controls</SectionCardTitle>
              <SectionCardDescription>
                Searchable selection, boolean settings, and exclusive choices.
              </SectionCardDescription>
            </Box>
          </SectionCardHeader>
          <SectionCardContent>
            <Stack spacing={6}>
              <AutocompleteField
                defaultValue="Minh Tran"
                label="Assign owner"
                name="assignee"
                options={people}
              />
              <SwitchField
                defaultChecked
                helperText="Send a summary after each workspace update."
                label="Email activity summary"
                name="activitySummary"
              />
              <RadioGroupField
                defaultValue="weekly"
                label="Report cadence"
                name="reportCadence"
                options={[
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                  { label: "Monthly", value: "monthly" },
                ]}
                row
              />
            </Stack>
          </SectionCardContent>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader>
            <Box>
              <SectionCardTitle component="h3">Loading & pagination</SectionCardTitle>
              <SectionCardDescription>
                Shared placeholders and standalone page navigation for async content.
              </SectionCardDescription>
            </Box>
          </SectionCardHeader>
          <SectionCardContent>
            <Stack spacing={7}>
              <LoadingState label="Loading report preview" lines={4} />
              <Pagination
                count={7}
                onChange={(_, nextPage) => setPage(nextPage)}
                page={page}
                siblingCount={0}
              />
            </Stack>
          </SectionCardContent>
          <SectionCardFooter>
            <Typography color="text.secondary" variant="caption">
              Showing standalone pagination state: page {page} of 7.
            </Typography>
          </SectionCardFooter>
        </SectionCard>
      </Box>

      <ConfirmDialog
        description="This demo keeps the safe cancel action focused. No data will actually be removed."
        intent="destructive"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        open={confirmOpen}
        title="Delete example record?"
      />
    </Box>
  );
}

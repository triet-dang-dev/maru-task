import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

import { ProjectQueryConfigurationTabs } from "./ProjectQueryConfigurationTabs";
import { ProjectQueryFiltersTab } from "./ProjectQueryFiltersTab";
import type { ProjectQueryConfiguration } from "./project-query-settings-model";

export function ProjectQueryConfigurationModal({
  configuration,
  onApply,
  onCancel,
}: {
  configuration: ProjectQueryConfiguration;
  onApply: (configuration: ProjectQueryConfiguration) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(configuration);

  return (
    <Modal
      actions={
        <>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
          <Button onClick={() => onApply(draft)}>Apply</Button>
        </>
      }
      maxWidth="md"
      onClose={onCancel}
      open
      title="Table configuration"
    >
      <Tabs defaultValue="filters">
        <TabList aria-label="Table configuration sections" variant="scrollable">
          <Tab label="Filters" value="filters" />
          <Tab label="Columns" value="columns" />
          <Tab label="Sort by" value="sort" />
          <Tab label="Display settings" value="display" />
        </TabList>
        <TabPanel value="filters">
          <ProjectQueryFiltersTab configuration={draft} onChange={setDraft} />
        </TabPanel>
        <ProjectQueryConfigurationTabs configuration={draft} onChange={setDraft} />
      </Tabs>
    </Modal>
  );
}

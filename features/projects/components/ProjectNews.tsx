"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Newspaper, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface NewsItem {
  author: string;
  content: string;
  id: string;
  publishedAt: string;
  title: string;
}

type CreateNewsFormValues = {
  content: string;
  title: string;
};

const defaultNews: NewsItem[] = [
  {
    author: "Dana Chen",
    content:
      "The team has successfully completed the migration phase. All work packages have been transferred and verified. The next sprint starts Monday.",
    id: "news-1",
    publishedAt: "Aug 15, 2026",
    title: "Migration phase complete",
  },
  {
    author: "Riley Park",
    content:
      "New CI/CD pipeline has been deployed. Deployment time reduced from 12 minutes to 3 minutes. All stages are green.",
    id: "news-2",
    publishedAt: "Aug 10, 2026",
    title: "CI/CD pipeline upgrade",
  },
];

export function ProjectNews({
  initialNews = defaultNews,
  projectId,
}: {
  initialNews?: NewsItem[];
  projectId?: string;
}) {
  const { success: toastSuccess } = useToast();
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<CreateNewsFormValues>({
    defaultValues: { content: "", title: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const handleCreateNews = ({ content, title }: CreateNewsFormValues) => {
    const newItem: NewsItem = {
      author: "You",
      content: content.trim(),
      id: `news-${Date.now()}`,
      publishedAt: "Just now",
      title: title.trim(),
    };
    setNews([newItem, ...news]);
    toastSuccess(`Published "${newItem.title}".`);
    reset();
    setIsAddOpen(false);
  };

  return (
    <Stack spacing={0}>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            News
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Project announcements and updates.
          </Typography>
        </Box>
        <Button
          onClick={() => setIsAddOpen(true)}
          startIcon={<Plus aria-hidden="true" size={16} />}
        >
          Add news
        </Button>
      </Stack>

      {news.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => setIsAddOpen(true)} variant="solid">
              Add news
            </Button>
          }
          description="No news items yet. Add the first announcement for this project."
          icon={<Newspaper size={40} />}
          title="No news yet"
        />
      ) : (
        <Stack spacing={3}>
          {news.map((item) => (
            <Box
              key={item.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                <Typography component="h2" sx={{ fontWeight: 700 }} variant="h6">
                  {item.title}
                </Typography>
                <Chip label={item.publishedAt} size="small" variant="outlined" />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="caption">
                by {item.author}
              </Typography>
              <Typography sx={{ mt: 1.5 }} variant="body2">
                {item.content}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {/* Add News Modal */}
      {isAddOpen ? (
        <Modal
          actions={
            <>
              <Button onClick={() => setIsAddOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button form="create-news-form" type="submit" variant="solid">
                Publish news
              </Button>
            </>
          }
          onClose={() => setIsAddOpen(false)}
          open
          title="Add project announcement"
        >
          <Stack
            component="form"
            id="create-news-form"
            noValidate
            onSubmit={handleSubmit(handleCreateNews)}
            spacing={3}
          >
            <InputField
              autoFocus
              control={control}
              label="Title"
              name="title"
              rules={{
                validate: (val) => val.trim().length > 0 || "Please enter an announcement title.",
              }}
            />
            <InputField
              control={control}
              label="Content"
              minRows={4}
              multiline
              name="content"
              rules={{
                validate: (val) => val.trim().length > 0 || "Please enter announcement content.",
              }}
            />
          </Stack>
        </Modal>
      ) : null}
    </Stack>
  );
}

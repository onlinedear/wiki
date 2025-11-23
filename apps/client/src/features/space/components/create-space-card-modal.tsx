import { Modal, Divider, Box, Stack, TextInput, Textarea, Group, Button, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSpaceMutation } from "@/features/space/queries/space-query.ts";
import { computeSpaceSlug } from "@/lib";
import { getSpaceUrl } from "@/lib/config.ts";
import { useTranslation } from "react-i18next";
import AvatarUploader from "@/components/common/avatar-uploader.tsx";
import { AvatarIconType } from "@/features/attachments/types/attachment.types.ts";

const createFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(2).max(50),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .regex(/^[a-zA-Z0-9]+$/, t("Space slug must be alphanumeric")),
    description: z.string().max(500),
  });

type FormValues = {
  name: string;
  slug: string;
  description: string;
};

interface CreateSpaceCardModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function CreateSpaceCardModal({ opened, onClose }: CreateSpaceCardModalProps) {
  const { t } = useTranslation();
  const createSpaceMutation = useCreateSpaceMutation();
  const navigate = useNavigate();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    validate: zodResolver(createFormSchema(t)),
    validateInputOnChange: ["slug"],
    initialValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  useEffect(() => {
    const name = form.values.name;
    const words = name.trim().split(/\s+/);

    const lastChar = name[name.length - 1];
    const lastWordIsIncomplete =
      words.length > 1 && words[words.length - 1].length === 1;

    if (lastChar !== " " || lastWordIsIncomplete) {
      const slug = computeSpaceSlug(name);
      form.setFieldValue("slug", slug);
    }
  }, [form.values.name]);

  const handleIconUpload = async (file: File) => {
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleIconRemove = async () => {
    setIconFile(null);
    setIconPreview(null);
  };

  const handleSubmit = async (data: {
    name?: string;
    slug?: string;
    description?: string;
  }) => {
    const spaceData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
    };

    const createdSpace = await createSpaceMutation.mutateAsync(spaceData);
    
    // If icon was uploaded, upload it after space creation
    if (iconFile && createdSpace?.id) {
      try {
        const { uploadSpaceIcon } = await import("@/features/attachments/services/attachment-service.ts");
        await uploadSpaceIcon(iconFile, createdSpace.id);
      } catch (err) {
        // Icon upload failed but space was created
        console.error("Failed to upload space icon:", err);
      }
    }

    form.reset();
    setIconFile(null);
    setIconPreview(null);
    onClose();
    navigate(getSpaceUrl(createdSpace.slug));
  };

  const handleClose = () => {
    form.reset();
    setIconFile(null);
    setIconPreview(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t("Create space")} size="md">
      <Divider size="xs" mb="md" />
      <Box maw="500" mx="auto">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Stack>
            <div>
              <Text size="sm" fw={500} mb="xs">
                {t("Space icon")}
              </Text>
              <AvatarUploader
                currentImageUrl={iconPreview}
                fallbackName={form.values.name || "Space"}
                size={"60px"}
                variant="filled"
                type={AvatarIconType.SPACE_ICON}
                onUpload={handleIconUpload}
                onRemove={handleIconRemove}
                isLoading={false}
              />
            </div>

            <TextInput
              withAsterisk
              id="name"
              label={t("Space name")}
              placeholder={t("e.g Product Team")}
              variant="filled"
              {...form.getInputProps("name")}
            />

            <TextInput
              withAsterisk
              id="slug"
              label={t("Space slug")}
              placeholder={t("e.g product")}
              variant="filled"
              {...form.getInputProps("slug")}
            />

            <Textarea
              id="description"
              label={t("Space description")}
              placeholder={t("e.g Space for product team")}
              variant="filled"
              autosize
              minRows={2}
              maxRows={8}
              {...form.getInputProps("description")}
            />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" loading={createSpaceMutation.isPending}>
              {t("Create")}
            </Button>
          </Group>
        </form>
      </Box>
    </Modal>
  );
}

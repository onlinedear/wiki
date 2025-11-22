import { Text, SimpleGrid, Card, rem, Group, Button, Center, Stack } from "@mantine/core";
import React from "react";
import {
  prefetchSpace,
  useGetSpacesQuery,
} from "@/features/space/queries/space-query.ts";
import { getSpaceUrl } from "@/lib/config.ts";
import { Link } from "react-router-dom";
import classes from "./space-grid.module.css";
import { formatMemberCount } from "@/lib";
import { useTranslation } from "react-i18next";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { CustomAvatar } from "@/components/ui/custom-avatar.tsx";
import { AvatarIconType } from "@/features/attachments/types/attachment.types.ts";
import { useDisclosure } from "@mantine/hooks";
import CreateSpaceCardModal from "./create-space-card-modal.tsx";

export default function SpaceGrid() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetSpacesQuery({ page: 1, limit: 10 });
  const [opened, { open, close }] = useDisclosure(false);

  const cards = data?.items.slice(0, 8).map((space, index) => (
    <Card
      key={space.id}
      p="xs"
      radius="md"
      component={Link}
      to={getSpaceUrl(space.slug)}
      onMouseEnter={() => prefetchSpace(space.slug, space.id)}
      className={classes.card}
      withBorder
    >
      <Card.Section className={classes.cardSection} h={40}></Card.Section>
      <CustomAvatar
        name={space.name}
        avatarUrl={space.logo}
        type={AvatarIconType.SPACE_ICON}
        color="initials"
        variant="filled"
        size="md"
        mt={rem(-20)}
      />

      <Text fz="md" fw={500} mt="xs" className={classes.title}>
        {space.name}
      </Text>

      <Text c="dimmed" size="xs" fw={700} mt="md">
        {formatMemberCount(space.memberCount, t)}
      </Text>
    </Card>
  ));

  return (
    <>
      <Group justify="space-between" align="center" mb="md">
        <Text fz="sm" fw={500}>
          {t("Spaces you belong to")}
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }}>
        {cards}
        <Card
          p="xs"
          radius="md"
          className={classes.card}
          withBorder
          style={{ cursor: "pointer" }}
          onClick={open}
        >
          <Center h="100%">
            <Stack align="center" gap="xs">
              <IconPlus size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="sm" c="dimmed" fw={500}>
                {t("Create space")}
              </Text>
            </Stack>
          </Center>
        </Card>
      </SimpleGrid>

      {data?.items && data.items.length > 8 && (
        <Group justify="flex-end" mt="lg">
          <Button
            component={Link}
            to="/spaces"
            variant="subtle"
            rightSection={<IconArrowRight size={16} />}
            size="sm"
          >
            {t("View all spaces")}
          </Button>
        </Group>
      )}

      <CreateSpaceCardModal opened={opened} onClose={close} />
    </>
  );
}

import { useState } from "react";
import { TextInput, Select, Button, Group, Stack } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface CommentSearchProps {
  onSearch: (filters: {
    searchText?: string;
    creatorId?: string;
    resolved?: boolean;
  }) => void;
  onClear: () => void;
}

export function CommentSearch({ onSearch, onClear }: CommentSearchProps) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [resolved, setResolved] = useState<string | null>(null);

  const handleSearch = () => {
    onSearch({
      searchText: searchText || undefined,
      resolved: resolved === "true" ? true : resolved === "false" ? false : undefined,
    });
  };

  const handleClear = () => {
    setSearchText("");
    setResolved(null);
    onClear();
  };

  return (
    <Stack gap="sm">
      <Group>
        <TextInput
          placeholder={t("Search comments...")}
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Select
          placeholder={t("Status")}
          value={resolved}
          onChange={setResolved}
          data={[
            { value: "false", label: t("Open") },
            { value: "true", label: t("Resolved") },
          ]}
          clearable
          style={{ width: 150 }}
        />
      </Group>
      <Group>
        <Button onClick={handleSearch} leftSection={<IconSearch size={16} />}>
          {t("Search")}
        </Button>
        <Button
          variant="subtle"
          onClick={handleClear}
          leftSection={<IconX size={16} />}
        >
          {t("Clear")}
        </Button>
      </Group>
    </Stack>
  );
}

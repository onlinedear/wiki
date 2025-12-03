import { useEffect, useState } from 'react';
import { Paper, Text, Stack, CloseButton, Group } from '@mantine/core';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const MemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [visible, setVisible] = useState(false); // 默认隐藏

  // 监听 Ctrl+M 快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // 只有在可见时才监控内存
    if (!visible) return;

    // 检查浏览器是否支持 performance.memory
    if (!('memory' in performance)) {
      console.warn('performance.memory is not supported in this browser');
      return;
    }

    const updateMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    };

    // 初始更新
    updateMemory();

    // 每秒更新一次
    const interval = setInterval(updateMemory, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || !memoryInfo) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  const getColor = () => {
    if (usagePercent > 80) return 'red';
    if (usagePercent > 60) return 'orange';
    return 'green';
  };

  return (
    <Paper
      shadow="lg"
      p="md"
      withBorder
      style={{
        position: 'fixed',
        top: 70, // 往下移50px (原来20px + 50px)
        right: 20,
        zIndex: 10000,
        minWidth: 280,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={600}>
          内存监控
        </Text>
        <CloseButton onClick={() => setVisible(false)} size="sm" />
      </Group>

      <Stack gap="xs">
        <div>
          <Text size="xs" c="dimmed">
            已使用
          </Text>
          <Text size="sm" fw={500} c={getColor()}>
            {formatBytes(memoryInfo.usedJSHeapSize)}
          </Text>
        </div>

        <div>
          <Text size="xs" c="dimmed">
            总分配
          </Text>
          <Text size="sm" fw={500}>
            {formatBytes(memoryInfo.totalJSHeapSize)}
          </Text>
        </div>

        <div>
          <Text size="xs" c="dimmed">
            限制
          </Text>
          <Text size="sm" fw={500}>
            {formatBytes(memoryInfo.jsHeapSizeLimit)}
          </Text>
        </div>

        <div>
          <Text size="xs" c="dimmed">
            使用率
          </Text>
          <Text size="sm" fw={500} c={getColor()}>
            {usagePercent.toFixed(1)}%
          </Text>
        </div>

        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: '#e9ecef',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${usagePercent}%`,
              height: '100%',
              backgroundColor: getColor(),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </Stack>
    </Paper>
  );
};

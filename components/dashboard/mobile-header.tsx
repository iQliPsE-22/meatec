"use client";

import { Avatar, Dropdown, MenuProps, Typography } from "antd";
import { ThunderboltOutlined, LogoutOutlined, BgColorsOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface MobileHeaderProps {
  username: string;
  theme: string;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function MobileHeader({ username, theme: currentTheme, onToggleTheme, onLogout }: MobileHeaderProps) {
  const items: MenuProps['items'] = [
    {
      key: 'user',
      label: (
        <div className="px-2 py-1.5">
          <Text type="secondary" className="text-xs uppercase tracking-wider block">Signed in as</Text>
          <Text className="font-semibold">{username}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'theme',
      icon: <BgColorsOutlined />,
      label: currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode',
      onClick: onToggleTheme,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
      onClick: onLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-md xl:hidden">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--background)]">
          <ThunderboltOutlined className="text-base" />
        </div>
        <div className="text-base font-bold tracking-tight">MeaTech</div>
      </div>

      <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
        <button className="flex items-center outline-none">
          <Avatar 
            size={36} 
            className="bg-[var(--foreground)] text-[var(--background)] cursor-pointer"
          >
            {username.slice(0, 1).toUpperCase()}
          </Avatar>
        </button>
      </Dropdown>
    </header>
  );
}

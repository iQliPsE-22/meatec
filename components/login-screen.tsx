"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { useAppState } from "@/lib/app-state";
import {
  Card,
  Form,
  Input,
  Button,
  Alert,
  Typography,
  Layout,
  theme,
} from "antd";

const { Title, Text } = Typography;

export function LoginScreen() {
  const router = useRouter();
  const { state, login, setTheme, clearError } = useAppState();
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.session) {
      router.replace("/dashboard");
    }
  }, [router, state.session]);

  const isDark = state.theme === "dark";

  async function onFinish(values: { username: string; password: string }) {
    clearError();
    const didLogin = await login({
      username: values.username,
      password: values.password,
    });
    if (didLogin) {
      router.push("/dashboard");
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <Layout className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <Button onClick={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
      <div className="w-full max-w-sm">
        <Card bordered={false} className="shadow-lg">
          <div className="text-center mb-6">
            <Title level={3} className="!mb-1">
              Sign In
            </Title>
            <Text type="secondary">
              Enter your credentials to access your dashboard
            </Text>
          </div>

          <Form
            layout="vertical"
            initialValues={{
              username: DEMO_CREDENTIALS.username,
              password: DEMO_CREDENTIALS.password,
            }}
            onFinish={onFinish}
            onChange={clearError}
            requiredMark={false}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input size="medium" placeholder="Enter username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password size="medium" placeholder="Enter password" />
            </Form.Item>

            {state.error ? (
              <Alert
                message={state.error}
                type="error"
                showIcon
                className="mb-4"
              />
            ) : null}

            <Form.Item className="mb-0 mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="medium"
                block
                loading={state.authStatus === "loading"}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div
            className="mt-8 rounded-xl p-4 text-center border"
            style={{ backgroundColor: token.colorFillAlter }}
          >
            <Text
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: token.colorTextSecondary }}
            >
              Demo Access
            </Text>
            <div className="mt-2 text-sm font-mono">
              <div>U: {DEMO_CREDENTIALS.username}</div>
              <div>P: {DEMO_CREDENTIALS.password}</div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

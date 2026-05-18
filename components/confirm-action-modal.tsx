"use client";

import { Button, Modal, Typography } from "antd";

const { Paragraph, Text } = Typography;

type ConfirmActionModalProps = {
  confirmLabel?: string;
  description: string;
  isLoading?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmActionModal({
  confirmLabel = "Confirm",
  description,
  isLoading = false,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: ConfirmActionModalProps) {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <div className="mt-4 space-y-5">
        <Paragraph className="!mb-0 leading-6">
          <Text type="secondary">{description}</Text>
        </Paragraph>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            size="medium"
            shape="round"
            className="min-h-10 px-5 active:scale-[0.96] transition-transform"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            size="medium"
            shape="round"
            loading={isLoading}
            className="min-h-10 px-5 font-semibold active:scale-[0.96] transition-transform"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

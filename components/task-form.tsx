"use client";

import { STATUS_OPTIONS, STATUS_LABELS } from "@/lib/constants";
import type { TaskInput, TaskStatus } from "@/types";
import { Form, Input, Select, Button } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";

const TaskSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters.")
    .required("Please input the title!"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters.")
    .required("Please input the description!"),
  status: Yup.string()
    .oneOf(STATUS_OPTIONS as readonly string[], "Select a valid status.")
    .required("Please select a status!"),
});

type TaskFormProps = {
  initialValues: TaskInput;
  isSaving: boolean;
  onSubmit: (values: TaskInput) => Promise<void>;
};

export function TaskForm({ initialValues, isSaving, onSubmit }: TaskFormProps) {
  const formik = useFormik({
    initialValues,
    validationSchema: TaskSchema,
    onSubmit: async (values) => {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status as TaskStatus,
      });
    },
    enableReinitialize: true,
  });

  return (
    <Form
      layout="vertical"
      onFinish={formik.handleSubmit}
      requiredMark={false}
      className="space-y-4"
    >
      <Form.Item
        label="Title"
        validateStatus={
          formik.touched.title && formik.errors.title ? "error" : ""
        }
        help={
          formik.touched.title && formik.errors.title
            ? formik.errors.title
            : undefined
        }
      >
        <Input
          id="task-title"
          size="medium"
          placeholder="e.g., Prepare release checklist"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      <Form.Item
        label="Description"
        validateStatus={
          formik.touched.description && formik.errors.description ? "error" : ""
        }
        help={
          formik.touched.description && formik.errors.description
            ? formik.errors.description
            : undefined
        }
      >
        <Input.TextArea
          id="task-description"
          size="medium"
          rows={4}
          className="resize-none"
          placeholder="e.g., Document QA steps, assign owners, and confirm launch timing."
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      <Form.Item
        label="Status"
        validateStatus={
          formik.touched.status && formik.errors.status ? "error" : ""
        }
        help={
          formik.touched.status && formik.errors.status
            ? formik.errors.status
            : undefined
        }
      >
        <Select
          id="task-status"
          size="medium"
          placeholder="Select a status"
          value={formik.values.status}
          onChange={(val) => formik.setFieldValue("status", val)}
          onBlur={() => formik.setFieldTouched("status", true)}
          aria-label="Status"
        >
          {STATUS_OPTIONS.map((status) => (
            <Select.Option key={status} value={status}>
              {STATUS_LABELS[status]}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item className="mb-0 mt-6 text-right">
        <Button
          type="primary"
          htmlType="submit"
          size="medium"
          loading={isSaving}
          className="font-semibold"
        >
          {isSaving ? "Saving..." : "Save Task"}
        </Button>
      </Form.Item>
    </Form>
  );
}

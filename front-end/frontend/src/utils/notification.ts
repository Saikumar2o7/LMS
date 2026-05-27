import { notification } from "antd";

export const showSuccess = (message: string, description?: string) => {
  notification.success({
    message,
    description,
    placement: "topRight",
    duration: 3,
  });
};

export const showError = (message: string, description?: string) => {
  notification.error({
    message,
    description,
    placement: "topRight",
    duration: 4,
  });
};

export const showInfo = (message: string, description?: string) => {
  notification.info({
    message,
    description,
    placement: "topRight",
    duration: 3,
  });
};

export const showWarning = (message: string, description?: string) => {
  notification.warning({
    message,
    description,
    placement: "topRight",
    duration: 3,
  });
};

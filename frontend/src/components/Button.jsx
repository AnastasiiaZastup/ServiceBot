import React from "react";
import styles from "./Button.module.css";
import classNames from "classnames"; // (постав через `npm i classnames`)

export default function Button({
  children,
  onClick,
  disabled = false,
  type = "default",
  style,
}) {
  const buttonClass = classNames(styles.button, {
    [styles.success]: type === "success",
    [styles.danger]: type === "danger",
    [styles.grey]: type === "grey",
  });

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

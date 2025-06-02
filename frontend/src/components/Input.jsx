// components/Input.jsx
import React from "react";
import styles from "./Input.module.css";

export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={styles.input}
      {...props}
    />
  );
}

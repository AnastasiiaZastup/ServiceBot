// components/Label.jsx
import React from "react";
import styles from "./Label.module.css";

export default function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
    </label>
  );
}

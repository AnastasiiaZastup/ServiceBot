import React from "react";
import styles from "./Button.module.css";

export default function Button({ children, onClick, disabled = false }) {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

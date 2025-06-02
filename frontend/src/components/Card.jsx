// components/Card.jsx
import React from "react";
import styles from "./Card.module.css";

export default function Card({ children, style }) {
  return (
    <div className={styles.card} style={style}>
      {children}
    </div>
  );
}

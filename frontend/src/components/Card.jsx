import styles from "./Card.module.css";

export default function Card({ children, style = {} }) {
  return (
    <div className={styles.card} style={{ ...style, width: "100%" }}>
      {children}
    </div>
  );
}

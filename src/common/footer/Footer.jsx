import styles from "./Footer.module.css";
import logo from "../../assets/images/logo.png";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerCopy}>
        Powered by
      </span>

      <img
        src={logo}
        alt="Token Volt"
        className="
          h-[25px]
          w-auto
          object-contain
          brightness-0
          dark:brightness-0
          dark:invert
        "
      />
    </footer>
  );
}

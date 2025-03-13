import Image from "next/image";
import styles from "./page.module.css";
import ImageContainer from "./ImagesContainer";
import InputFileUpload from "./uploadButton";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.title}>Galeria CloudFlare</header>
      <main className={styles.main}>
        <div className={styles.ButtonUpload}>
          <InputFileUpload />
        </div>
        <div>
          <ImageContainer />
        </div>
      </main>
    </div>
  );
}

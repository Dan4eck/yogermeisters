import { Link } from 'wouter';

import styles from './CabinetPage.module.css';

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.authCard}>
        <Link href='/' className={styles.brand}>yogermeisters</Link>
        <span className={styles.eyebrow}>Личный кабинет</span>
        <h1>Войдите, чтобы продолжить обучение</h1>
        <p>Используйте Google-аккаунт, на email которого был выдан доступ к курсу.</p>
        <a className={styles.primaryButton} href='/auth/google'>Войти через Google</a>
        <Link href='/' className={styles.textLink}>Вернуться на сайт</Link>
      </section>
    </main>
  );
}

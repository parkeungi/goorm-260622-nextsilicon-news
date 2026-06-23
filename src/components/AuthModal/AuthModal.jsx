import { useState } from "react";
import styles from "./AuthModal.module.css";

// 회원가입/로그인 모달. App에서 내려준 signUp/signIn 함수를 사용한다.
export default function AuthModal({ mode: initialMode, onClose, signUp, signIn }) {
  const [mode, setMode] = useState(initialMode || "login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  function translateError(message) {
    const map = {
      "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
      "User already registered": "이미 가입된 이메일입니다. 로그인해 주세요.",
      "Password should be at least 6 characters":
        "비밀번호는 최소 6자 이상이어야 합니다.",
      "Unable to validate email address: invalid format":
        "이메일 형식이 올바르지 않습니다.",
      "Email not confirmed":
        "이메일 인증이 완료되지 않았습니다. 받은 메일의 인증 링크를 확인해 주세요.",
    };
    return map[message] || message;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const data = await signUp(email, password);
        // 이메일 인증이 켜져 있으면 세션 없이 확인 메일이 발송된다.
        if (!data.session) {
          setNotice(
            "가입 확인 메일을 보냈습니다. 메일의 인증 링크를 클릭한 뒤 로그인해 주세요."
          );
          setMode("login");
        } else {
          onClose();
        }
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className={styles.close} onClick={onClose} aria-label="닫기">
          ×
        </button>

        <div className={styles.tabs}>
          <button
            className={mode === "login" ? styles.tabActive : styles.tab}
            onClick={() => switchMode("login")}
            type="button"
          >
            로그인
          </button>
          <button
            className={mode === "signup" ? styles.tabActive : styles.tab}
            onClick={() => switchMode("signup")}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            이메일
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className={styles.label}>
            비밀번호
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="최소 6자 이상"
              minLength={6}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          {error && <p className={styles.error}>⚠️ {error}</p>}
          {notice && <p className={styles.notice}>✅ {notice}</p>}

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting
              ? "처리 중..."
              : mode === "signup"
              ? "회원가입"
              : "로그인"}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === "signup" ? (
            <>
              이미 계정이 있으신가요?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                로그인
              </button>
            </>
          ) : (
            <>
              계정이 없으신가요?{" "}
              <button type="button" onClick={() => switchMode("signup")}>
                회원가입
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

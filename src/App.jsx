import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import UserProfile from "./components/UserProfile/UserProfile";
import SearchPanel from "./components/SearchPanel/SearchPanel";
import NewsCard from "./components/NewsCard/NewsCard";
import InsightCard from "./components/InsightCard/InsightCard";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage/ErrorMessage";
import { useNewsBriefing } from "./hooks/useNewsBriefing";
import { useAuth } from "./hooks/useAuth";
import AuthModal from "./components/AuthModal/AuthModal";
import Footer from "./components/Footer/Footer";
import styles from "./App.module.css";

export default function App() {
  const [userProfile, setUserProfile] = useState("business");
  const [selectedLLM, setSelectedLLM] = useState("claude");
  const [insightMeta, setInsightMeta] = useState(null);

  const { user, signUp, signIn, signOut } = useAuth();
  const [authMode, setAuthMode] = useState(null); // null | "login" | "signup"

  const { articles, insight, isLoadingNews, isLoadingLLM, error, runBriefing } =
    useNewsBriefing();

  // Restore preferences from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("semisignal_profile");
    const savedLLM = localStorage.getItem("semisignal_llm");
    if (savedProfile) setUserProfile(savedProfile);
    if (savedLLM) setSelectedLLM(savedLLM);
  }, []);

  function handleProfileChange(profile) {
    setUserProfile(profile);
    localStorage.setItem("semisignal_profile", profile);
  }

  function handleLLMChange(llm) {
    setSelectedLLM(llm);
    localStorage.setItem("semisignal_llm", llm);
  }

  function handleSearch(keyword, options) {
    // Save to search history
    const history = JSON.parse(
      localStorage.getItem("semisignal_history") || "[]"
    );
    const entry = { keyword, timestamp: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, 10);
    localStorage.setItem("semisignal_history", JSON.stringify(updated));

    setInsightMeta({ llm: selectedLLM, profile: userProfile, generatedAt: new Date() });
    runBriefing(keyword, { ...options, llm: selectedLLM, profile: userProfile });
  }

  const isLoading = isLoadingNews || isLoadingLLM;

  return (
    <div className={styles.app}>
      <Header
        user={user}
        onOpenLogin={() => setAuthMode("login")}
        onOpenSignup={() => setAuthMode("signup")}
        onLogout={signOut}
      />
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          signUp={signUp}
          signIn={signIn}
        />
      )}
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.controls}>
            <UserProfile
              selectedProfile={userProfile}
              onProfileChange={handleProfileChange}
            />
            <SearchPanel
              onSearch={handleSearch}
              selectedLLM={selectedLLM}
              onLLMChange={handleLLMChange}
              isLoading={isLoading}
            />
          </section>

          <section className={styles.results}>
            {isLoadingNews && (
              <LoadingSpinner message="💡 뉴스 수집 중..." />
            )}
            {isLoadingLLM && (
              <LoadingSpinner message="🤖 AI 분석 중..." />
            )}
            {error && <ErrorMessage message={error} />}

            {!isLoading && articles.length === 0 && !error && !insight && (
              <div className={styles.empty}>
                <p>키워드 프리셋을 선택하거나 직접 입력한 뒤 <strong>검색</strong>을 눌러 주세요.</p>
              </div>
            )}

            {articles.length === 0 && !isLoading && insight && (
              <div className={styles.noArticles}>
                검색 결과가 없습니다. 키워드를 변경해 보세요.
              </div>
            )}

            {articles.length > 0 && (
              <>
                <div className={styles.articlesHeader}>
                  <h2 className={styles.articlesTitle}>
                    수집된 뉴스 ({articles.length}건)
                  </h2>
                </div>
                <div className={styles.grid}>
                  {articles.map((a) => (
                    <NewsCard key={a.url} article={a} />
                  ))}
                </div>
              </>
            )}

            {insight && insightMeta && (
              <InsightCard
                insight={insight}
                llmName={insightMeta.llm}
                profileName={insightMeta.profile}
                generatedAt={insightMeta.generatedAt}
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { createClient } from "@supabase/supabase-js";

// Supabase 인증 클라이언트.
// URL과 publishable(anon) 키는 클라이언트에 노출되어도 안전한 값이다.
// (실제 권한 제어는 Supabase의 Row Level Security 정책으로 수행)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. 회원가입·로그인이 동작하지 않습니다."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

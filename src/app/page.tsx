'use client';

import { Scoreboard } from "@/components/scoreboard/Scoreboard";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * メンテナンスガード コンポーネント
 * Firestoreの status/app_status ドキュメントを監視し、
 * メンテナンス中の場合は専用の画面を表示してアプリ本体へのアクセスを制限します。
 */
function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  
  // 監視対象ドキュメントの参照を作成
  const statusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "settings", "app_status");
  }, [firestore]);

  // リアルタイムリスナーを開始
  const { data: status, isLoading } = useDoc(statusRef);

  // 初回読み込み中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  // メンテナンスモードが有効な場合
  if (status?.isMaintenance) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 border-2 border-destructive p-8 rounded-3xl max-w-lg shadow-2xl animate-in zoom-in-95 duration-500">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-4 uppercase tracking-tight text-white">
            メンテナンス中
          </h1>
          <p className="text-white/70 font-medium leading-relaxed">
            只今、アクセス集中によりメンテナンス中です。<br />
            しばらく経ってから再度お試しください。
          </p>
        </div>
      </main>
    );
  }

  // 通常時はアプリ本体を表示
  return <>{children}</>;
}

/**
 * メインエントリーポイント
 * アプリケーションをFirebase Providerでラップし、メンテナンス監視を有効にします。
 */
export default function Home() {
  return (
    <FirebaseClientProvider>
      <MaintenanceGuard>
        <Scoreboard />
      </MaintenanceGuard>
    </FirebaseClientProvider>
  );
}

import { Route, Switch, useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchOverlay } from "@/components/search";
import { ProtectedRoute } from "@/components/protected-route";
import { HomePage } from "@/pages/home";
import { PostPage } from "@/pages/post";
import { ArchivePage } from "@/pages/archive";
import { AboutPage } from "@/pages/about";
import { AdminLogin } from "@/pages/admin/login";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminEditor } from "@/pages/admin/editor";
import { AdminSettings } from "@/pages/admin/settings";
import { AdminBackup } from "@/pages/admin/backup";
import { AdminPages } from "@/pages/admin/pages";
import { AdminComments } from "@/pages/admin/comments";
import { AdminMedia } from "@/pages/admin/media";
import { DynamicPage } from "@/pages/dynamic-page";

export function App() {
  const [location] = useLocation();
  const isEditorPage = location.startsWith("/admin/editor");

  return (
    <>
      <Navbar />
      <SearchOverlay />
      {isEditorPage ? (
        /* 编辑器全屏布局 — 不受 main 容器限制 */
        <main className="mx-auto w-full px-[16px] flex-1 flex flex-col">
          <Switch>
            <Route path="/admin/editor/:slug?">
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            </Route>
          </Switch>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1440px] px-[20px] lg:px-[40px] flex-1 flex flex-col">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/posts/:slug" component={PostPage} />
            <Route path="/archive" component={ArchivePage} />
            <Route path="/about" component={AboutPage} />
            {/* 登录页不需要守卫 */}
            <Route path="/admin/login" component={AdminLogin} />
            {/* 以下所有后台页面均需认证 */}
            <Route path="/admin/settings">
              <ProtectedRoute><AdminSettings /></ProtectedRoute>
            </Route>
            <Route path="/admin/backup">
              <ProtectedRoute><AdminBackup /></ProtectedRoute>
            </Route>
            <Route path="/admin/pages">
              <ProtectedRoute><AdminPages /></ProtectedRoute>
            </Route>
            <Route path="/admin/comments">
              <ProtectedRoute><AdminComments /></ProtectedRoute>
            </Route>
            <Route path="/admin/media">
              <ProtectedRoute><AdminMedia /></ProtectedRoute>
            </Route>
            <Route path="/admin">
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            </Route>
            <Route path="/page/:slug" component={DynamicPage} />
            <Route>
              <div className="flex flex-1 items-center justify-center">
                <h1 className="text-[28px] font-semibold text-muted-foreground">
                  404 — 页面未找到
                </h1>
              </div>
            </Route>
          </Switch>
        </main>
      )}
      {!isEditorPage && <Footer />}
    </>
  );
}

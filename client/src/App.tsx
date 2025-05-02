import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BlogPage from "@/pages/blog-page";
import PostPage from "@/pages/post-page";
import CreatePost from "@/pages/create-post";
import { ProtectedRoute } from "@/lib/protected-route";
import ContactPage from "@/pages/contact-page";
import GoToTopButton from "@/components/go-to-top-button";
import ScrollToTop from "@/components/scroll-to-top";
import ProfilePage from "@/pages/profile-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/post/:id" component={PostPage} />
      <ProtectedRoute path="/create-post" component={CreatePost} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Router />
      <GoToTopButton />
      <Toaster />
    </>
  );
}

export default App;

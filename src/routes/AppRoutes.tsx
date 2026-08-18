import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../components/ProtectedRoute';
import { LayoutShell } from '../components/LayoutShell';
import { LoginView } from '../features/auth/LoginView';
import { RegisterView } from '../features/auth/RegisterView';
import { FeedView } from '../features/feed/FeedView';
import { ProfileView } from '../features/profile/ProfileView';
import { PostsView } from '../features/posts/PostsView';
import { SearchView } from '../features/search/SearchView';
import { SettingsView } from '../features/settings/SettingsView';
import { ChatView } from '../features/chat/ChatView';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutShell />}>
          <Route path="/" element={<FeedView />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/create" element={<PostsView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/profile/:username" element={<ProfileView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

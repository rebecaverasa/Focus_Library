import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { HistoryPage } from '@/features/history/HistoryPage';
import { RoomPage } from '@/features/room/RoomPage';
import { SharedRoomsPage } from '@/features/rooms/SharedRoomsPage';
import { AppShell } from '@/layout/AppShell';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <RoomPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'rooms', element: <SharedRoomsPage /> },
      // Unknown paths fall back to the room rather than a dead end.
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

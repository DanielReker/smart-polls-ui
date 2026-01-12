import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { CreatePollPage } from './pages/CreatePollPage';
import {RouterProvider} from "react-router/dom";
import {createBrowserRouter} from "react-router";
import {EditPollPage} from "./pages/EditPollPage.tsx";
import {TakePollPage} from "./pages/TakePollPage.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'create', element: <CreatePollPage /> },
            { path: 'polls/:pollId/edit', element: <EditPollPage /> },
            { path: 'polls/:pollId', element: <TakePollPage /> },
            // { path: 'polls/:pollId/stats', element: <StatsPage /> },
        ],
    },
]);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
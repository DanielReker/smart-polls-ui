import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider} from './auth/AuthProvider';
import {MainLayout} from './components/layout/MainLayout';
import {HomePage} from './pages/HomePage';
import {CreateQuizPage} from './pages/CreateQuizPage';
import {RouterProvider} from "react-router/dom";
import {createBrowserRouter} from "react-router";
import {EditQuizPage} from "./pages/EditQuizPage.tsx";
import {TakeQuizPage} from "./pages/TakeQuizPage.tsx";
import {CssBaseline} from "@mui/material";
import {AuthPage} from "./pages/AuthPage.tsx";
import {StatsPage} from "./pages/StatsPage.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'login', element: <AuthPage /> },
            { path: 'create', element: <CreateQuizPage /> },
            { path: 'quizzes/:quizId/edit', element: <EditQuizPage /> },
            { path: 'quizzes/:quizId', element: <TakeQuizPage /> },
            { path: 'quizzes/:quizId/stats', element: <StatsPage /> },
        ],
    },
]);

function App() {
    return (<>
        <CssBaseline/>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    </>);
}

export default App;
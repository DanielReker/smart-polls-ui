import { defineConfig } from 'orval';

export default defineConfig({
    'smart-poll-api': {
        input: './api-docs.yaml',
        output: {
            mode: 'tags-split',
            target: 'src/api/generated',
            schemas: 'src/api/model',
            client: 'react-query',
            httpClient: 'axios',
            baseUrl: '',
            override: {
                mutator: {
                    path: './src/api/axios.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
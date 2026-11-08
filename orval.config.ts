import { defineConfig } from 'orval';

export default defineConfig({
    'smart-poll-api': {
        input: './src/api/api-docs.yaml',
        output: {
            mode: 'tags-split',
            target: 'src/api/generated',
            schemas: 'src/api/generated/model',
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
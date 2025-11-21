import { config, fields, collection } from '@keystatic/core';

export default config({
    storage: {
        kind: 'local',
    },
    collections: {
        posts: collection({
            label: 'Posts',
            slugField: 'title',
            path: 'src/content/blog/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                date: fields.date({ label: 'Date' }),
                description: fields.text({ label: 'Description', multiline: true }),
                tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags' }),
                category: fields.select({
                    label: 'Category',
                    options: [
                        { label: 'Math', value: 'math' },
                        { label: 'History', value: 'history' },
                        { label: 'Translation', value: 'translation' },
                        { label: 'Tech', value: 'tech' },
                    ],
                    defaultValue: 'tech',
                }),
                draft: fields.checkbox({ label: 'Draft' }),
                mathjax: fields.checkbox({ label: 'Enable MathJax', defaultValue: true }),
                content: fields.document({
                    label: 'Content',
                    formatting: true,
                    dividers: true,
                    links: true,
                    images: {
                        directory: 'public/images/posts',
                        publicPath: '/images/posts/',
                    },
                }),
            },
        }),
        photos: collection({
            label: 'Photography',
            slugField: 'title',
            path: 'src/content/photos/*',
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                cloudinaryId: fields.text({ label: 'Cloudinary Public ID' }),
                date: fields.date({ label: 'Date Taken' }),
                location: fields.text({ label: 'Location' }),
                camera: fields.text({ label: 'Camera Settings' }),
                tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags' }),
            },
        }),
        pdfs: collection({
            label: 'PDFs',
            slugField: 'title',
            path: 'src/content/pdfs/*',
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                filename: fields.text({ label: 'Filename (in /public/pdfs/)' }),
                description: fields.text({ label: 'Description', multiline: true }),
                category: fields.text({ label: 'Category' }),
                uploadDate: fields.date({ label: 'Upload Date' }),
            },
        }),
        recommendations: collection({
            label: 'Recommendations',
            slugField: 'title',
            path: 'src/content/recommendations/*',
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                link: fields.url({ label: 'Link' }),
                status: fields.select({
                    label: 'Status',
                    options: [
                        { label: 'Read', value: 'read' },
                        { label: 'To Read', value: 'toread' },
                    ],
                    defaultValue: 'toread',
                }),
                notes: fields.text({ label: 'Notes', multiline: true }),
            },
        }),
    },
});

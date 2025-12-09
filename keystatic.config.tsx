import { config, fields, collection } from '@keystatic/core';

export default config({
    storage: {
        kind: 'local',
    },
    ui: {
        brand: {
            name: 'Ken\'s Blog CMS',
        },
        navigation: {
            'Content': ['photos', 'pdfs', 'recommendations'],
            'Social': ['friends'],
        },
    },
    collections: {
        // Posts are managed via Obsidian (pure Markdown for Zhihu compatibility)
        // Edit posts directly in src/content/blog/*.md
        photos: collection({
            label: 'Photography',
            slugField: 'title',
            path: 'src/content/photos/*',
            format: 'json',
            schema: {
                title: fields.text({ label: 'Title' }),
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
            format: 'json',
            schema: {
                title: fields.text({ label: 'Title' }),
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
            format: 'json',
            schema: {
                title: fields.text({ label: 'Title' }),
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
        friends: collection({
            label: 'Friends',
            slugField: 'name',
            path: 'src/content/friends/*',
            format: 'json',
            schema: {
                name: fields.text({ label: 'Name' }),
                url: fields.url({ label: 'Blog URL', validation: { isRequired: true } }),
                avatar: fields.url({ label: 'Avatar URL' }),
                description: fields.text({ label: 'Description' }),
            },
        }),
    },
});

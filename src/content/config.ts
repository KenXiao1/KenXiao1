import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        category: z.enum(['math', 'history', 'translation', 'tech']).default('tech'),
        draft: z.boolean().default(false),
        mathjax: z.boolean().default(true),
    }),
});

const photos = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        cloudinaryId: z.string(),
        date: z.coerce.date(),
        location: z.string().optional(),
        camera: z.string().optional(),
        tags: z.array(z.string()).optional(),
        album: z.enum(['stickers-on-desks', 'others']).default('others'),
        rotation: z.number().optional(), // Rotation angle in degrees (90, 180, 270) for correcting orientation
    }),
});

const pdfs = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        filename: z.string(),
        description: z.string().optional(),
        category: z.string(),
        uploadDate: z.coerce.date(),
    }),
});

const recommendations = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        link: z.string().url().optional(),
        status: z.enum(['read', 'toread']).default('toread'),
        notes: z.string().optional(),
    }),
});

export const collections = { blog, photos, pdfs, recommendations };

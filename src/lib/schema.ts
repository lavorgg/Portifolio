import { z } from "zod";

export const areaSchema = z.enum(["dev", "mkt"]);
export type Area = z.infer<typeof areaSchema>;

// Só links http(s) ou caminhos do próprio site: bloqueia "javascript:" e afins.
const url = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || /^\/(?!\/)/.test(v), "use um link que comece com https://");
const text = (max = 300) => z.string().trim().max(max);

export const mediaSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video", "youtube"]),
  url,
  caption: text(200).default(""),
});

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  area: areaSchema,
  title: text(120).min(1),
  client: text(120).default(""),
  year: text(20).default(""),
  role: text(160).default(""),
  summary: text(280).default(""),
  description: text(8000).default(""),
  tags: z.array(text(40)).max(20).default([]),
  liveUrl: url.default(""),
  repoUrl: url.default(""),
  cover: url.default(""),
  media: z.array(mediaSchema).max(40).default([]),
  results: z.array(z.object({ value: text(30), label: text(80) })).max(6).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sample: z.boolean().optional(),
});

export const contentSchema = z.object({
  profile: z.object({
    name: text(80).min(1),
    role: text(120),
    headline: text(160),
    intro: text(600),
    story: text(6000),
    location: text(80),
    photo: url,
    email: text(120),
    phone: text(40),
    whatsapp: text(40),
    linkedin: url,
    github: url,
    instagram: url,
    cvUrl: url,
    available: z.boolean(),
  }),
  techs: z.array(z.object({ id: z.string(), name: text(40).min(1), area: areaSchema })).max(80),
  courses: z
    .array(
      z.object({
        id: z.string(),
        title: text(140).min(1),
        school: text(100),
        year: text(20),
        area: areaSchema,
        url,
      }),
    )
    .max(80),
  experience: z
    .array(
      z.object({
        id: z.string(),
        role: text(120).min(1),
        company: text(120),
        period: text(60),
        description: text(600),
        area: areaSchema,
      }),
    )
    .max(40),
  projects: z.array(projectSchema).max(200),
});

export type Content = z.infer<typeof contentSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type Profile = Content["profile"];

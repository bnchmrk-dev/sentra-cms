import { z } from "zod";

// ============================================
// Stats Schemas
// ============================================

export const statsPeriodSchema = z.enum(["7d", "30d", "90d"]);
export type StatsPeriod = z.infer<typeof statsPeriodSchema>;

export const timePointSchema = z.object({
  date: z.string(),
  count: z.number(),
});
export type TimePoint = z.infer<typeof timePointSchema>;

export const timeSeriesSchema = z.object({
  label: z.string(),
  data: z.array(timePointSchema),
  total: z.number(),
});
export type TimeSeries = z.infer<typeof timeSeriesSchema>;

export const roleBreakdownSchema = z.object({
  user: z.number(),
  admin: z.number(),
  superadmin: z.number(),
});
export type RoleBreakdown = z.infer<typeof roleBreakdownSchema>;

export const statsResponseSchema = z.object({
  totals: z.object({
    users: z.number(),
    companies: z.number(),
    videos: z.number(),
    questions: z.number(),
    answers: z.number(),
  }),
  roleBreakdown: roleBreakdownSchema,
  growth: z.object({
    users: timeSeriesSchema,
    companies: timeSeriesSchema,
    videos: timeSeriesSchema,
    questions: timeSeriesSchema,
  }),
  period: statsPeriodSchema,
});
export type StatsResponse = z.infer<typeof statsResponseSchema>;

// ============================================
// Base Schemas
// ============================================

export const userRoleSchema = z.enum(["user", "admin", "superadmin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const domainSchema = z.object({
  id: z.string(),
  domain: z.string(),
  companyId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Domain = z.infer<typeof domainSchema>;

export const companyBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string().default("UTC"), // IANA timezone identifier
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const companySchema = companyBaseSchema.extend({
  domains: z.array(domainSchema.omit({ companyId: true, updatedAt: true })),
  _count: z
    .object({
      users: z.number(),
    })
    .optional(),
});
export type Company = z.infer<typeof companySchema>;

export const userBaseSchema = z.object({
  id: z.string(),
  clerkId: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: userRoleSchema,
  companyId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userSchema = userBaseSchema.extend({
  company: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
});
export type User = z.infer<typeof userSchema>;

// Company with users (for detail view)
export const companyWithUsersSchema = companySchema.extend({
  users: z
    .array(
      userBaseSchema.pick({
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      })
    )
    .optional(),
});
export type CompanyWithUsers = z.infer<typeof companyWithUsersSchema>;

// ============================================
// Request Schemas (for form validation)
// ============================================

export const createCompanyInputSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name is too long"),
  timezone: z.string().default("UTC"),
});
export type CreateCompanyInput = z.infer<typeof createCompanyInputSchema>;

export const updateCompanyInputSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name is too long").optional(),
  timezone: z.string().optional(),
});
export type UpdateCompanyInput = z.infer<typeof updateCompanyInputSchema>;

export const addDomainInputSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/,
      "Invalid domain format (e.g. acme.com)"
    )
    .transform((d) => d.toLowerCase()),
});
export type AddDomainInput = z.infer<typeof addDomainInputSchema>;

export const updateUserRoleInputSchema = z.object({
  role: userRoleSchema,
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleInputSchema>;

export const checkDomainInputSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type CheckDomainInput = z.infer<typeof checkDomainInputSchema>;

// ============================================
// Response Schemas (for API response validation)
// ============================================

export const companiesResponseSchema = z.object({
  companies: z.array(companySchema),
});
export type CompaniesResponse = z.infer<typeof companiesResponseSchema>;

export const companyResponseSchema = z.object({
  company: companyWithUsersSchema,
});
export type CompanyResponse = z.infer<typeof companyResponseSchema>;

export const usersResponseSchema = z.object({
  users: z.array(userSchema),
});
export type UsersResponse = z.infer<typeof usersResponseSchema>;

export const userResponseSchema = z.object({
  user: userSchema,
});
export type UserResponse = z.infer<typeof userResponseSchema>;

export const domainResponseSchema = z.object({
  domain: domainSchema,
});
export type DomainResponse = z.infer<typeof domainResponseSchema>;

export const checkDomainResponseSchema = z.object({
  allowed: z.boolean(),
  message: z.string().optional(),
  companyName: z.string().optional(),
});
export type CheckDomainResponse = z.infer<typeof checkDomainResponseSchema>;

export const authMeResponseSchema = z.object({
  user: userSchema,
});
export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;

export const registerUserResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
});
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>;

export const messageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof messageResponseSchema>;

// ============================================
// Video Schemas
// ============================================

export const videoBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  publishDate: z.string(),
  companyId: z.string().nullable(), // null = visible to everyone
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Video with company details (for list/detail views)
export const videoWithCompanySchema = videoBaseSchema.extend({
  company: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
});

export type Video = z.infer<typeof videoBaseSchema>;
export type VideoWithCompany = z.infer<typeof videoWithCompanySchema>;

export const createVideoInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  publishDate: z.string().min(1, "Publish date is required"),
  companyId: z.string().nullable().optional(), // null = visible to everyone
});
export type CreateVideoInput = z.infer<typeof createVideoInputSchema>;

export const updateVideoInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long").optional(),
  publishDate: z.string().optional(),
  companyId: z.string().nullable().optional(), // null = visible to everyone
});
export type UpdateVideoInput = z.infer<typeof updateVideoInputSchema>;

export const videoResponseSchema = z.object({
  video: videoWithCompanySchema,
});
export type VideoResponse = z.infer<typeof videoResponseSchema>;

export const videosResponseSchema = z.object({
  videos: z.array(videoWithCompanySchema),
});
export type VideosResponse = z.infer<typeof videosResponseSchema>;

// ============================================
// Question & Answer Schemas
// ============================================

export const answerBaseSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  order: z.number(),
  questionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Answer = z.infer<typeof answerBaseSchema>;

export const questionBaseSchema = z.object({
  id: z.string(),
  text: z.string(),
  order: z.number(),
  videoId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Question = z.infer<typeof questionBaseSchema>;

export const questionWithAnswersSchema = questionBaseSchema.extend({
  answers: z.array(answerBaseSchema),
});
export type QuestionWithAnswers = z.infer<typeof questionWithAnswersSchema>;

// Input schemas for forms
export const answerInputSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Answer text is required").max(500, "Answer is too long"),
  isCorrect: z.boolean(),
  order: z.number().int().min(0).optional(),
});
export type AnswerInput = z.infer<typeof answerInputSchema>;

export const createQuestionInputSchema = z.object({
  text: z.string().min(1, "Question text is required").max(1000, "Question is too long"),
  order: z.number().int().min(0).optional(),
  answers: z.array(answerInputSchema).min(2, "At least 2 answers are required"),
});
export type CreateQuestionInput = z.infer<typeof createQuestionInputSchema>;

export const updateQuestionInputSchema = z.object({
  text: z.string().min(1, "Question text is required").max(1000, "Question is too long").optional(),
  order: z.number().int().min(0).optional(),
  answers: z.array(answerInputSchema).min(2, "At least 2 answers are required").optional(),
});
export type UpdateQuestionInput = z.infer<typeof updateQuestionInputSchema>;

// Response schemas
export const questionResponseSchema = z.object({
  question: questionWithAnswersSchema,
});
export type QuestionResponse = z.infer<typeof questionResponseSchema>;

export const questionsResponseSchema = z.object({
  questions: z.array(questionWithAnswersSchema),
});
export type QuestionsResponse = z.infer<typeof questionsResponseSchema>;

// ============================================
// Error Schema
// ============================================

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  message: z.string().optional(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;


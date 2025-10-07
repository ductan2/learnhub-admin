import type { Submission, SubmissionFilters, SubmissionStats, GradeSubmissionDto, BulkGradeDto } from '@/types/submission'
import { delay } from '@/lib/api/utils'
import { mockSubmissions, mockUsers } from '@/lib/mock-data'

export const submissions = {
  getAll: async (filters?: SubmissionFilters): Promise<Submission[]> => {
    await delay()
    let submissions = [...mockSubmissions]

    if (filters?.type) {
      submissions = submissions.filter((s) => s.type === filters.type)
    }
    if (filters?.status) {
      submissions = submissions.filter((s) => s.status === filters.status)
    }
    if (filters?.user_id) {
      submissions = submissions.filter((s) => s.user_id === filters.user_id)
    }
    if (filters?.assignment_id) {
      submissions = submissions.filter((s) => s.assignment_id === filters.assignment_id)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      submissions = submissions.filter(
        (s) =>
          s.assignment_title.toLowerCase().includes(search) ||
          s.content?.toLowerCase().includes(search) ||
          s.teacher_feedback?.toLowerCase().includes(search),
      )
    }
    if (filters?.date_from) {
      submissions = submissions.filter((s) => s.submitted_at >= filters.date_from!)
    }
    if (filters?.date_to) {
      submissions = submissions.filter((s) => s.submitted_at <= filters.date_to!)
    }

    submissions = submissions.map((s) => ({ ...s, user: mockUsers.find((u) => u.id === s.user_id) }))

    return submissions.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
  },

  getById: async (id: string): Promise<Submission> => {
    await delay()
    const submission = mockSubmissions.find((s) => s.id === id)
    if (!submission) throw new Error('Submission not found')
    return { ...submission, user: mockUsers.find((u) => u.id === submission.user_id) }
  },

  getStats: async (): Promise<SubmissionStats> => {
    await delay()
    const total = mockSubmissions.length
    const pending = mockSubmissions.filter((s) => s.status === 'pending').length
    const graded = mockSubmissions.filter((s) => s.status === 'graded').length
    const rejected = mockSubmissions.filter((s) => s.status === 'rejected').length
    const needs_revision = mockSubmissions.filter((s) => s.status === 'needs_revision').length

    const by_type: Record<string, number> = {}
    mockSubmissions.forEach((s) => {
      by_type[s.type] = (by_type[s.type] || 0) + 1
    })

    const aiScores = mockSubmissions.filter((s) => s.ai_score).map((s) => s.ai_score!)
    const teacherScores = mockSubmissions.filter((s) => s.teacher_score).map((s) => s.teacher_score!)

    const average_ai_score = aiScores.length > 0 ? aiScores.reduce((a, b) => a + b, 0) / aiScores.length : 0
    const average_teacher_score = teacherScores.length > 0 ? teacherScores.reduce((a, b) => a + b, 0) / teacherScores.length : 0

    return { total, pending, graded, rejected, needs_revision, by_type, average_ai_score, average_teacher_score }
  },

  grade: async (data: GradeSubmissionDto): Promise<Submission> => {
    await delay()
    const submission = mockSubmissions.find((s) => s.id === data.submission_id)
    if (!submission) throw new Error('Submission not found')

    submission.teacher_score = data.teacher_score
    submission.teacher_feedback = data.teacher_feedback
    submission.status = data.status
    submission.graded_at = new Date().toISOString()
    submission.graded_by = '2'

    return { ...submission, user: mockUsers.find((u) => u.id === submission.user_id) }
  },

  bulkGrade: async (data: BulkGradeDto): Promise<Submission[]> => {
    await delay()
    const gradedSubmissions: Submission[] = []
    for (const id of data.submission_ids) {
      const submission = mockSubmissions.find((s) => s.id === id)
      if (submission) {
        submission.teacher_score = data.teacher_score
        submission.teacher_feedback = data.teacher_feedback
        submission.status = data.status
        submission.graded_at = new Date().toISOString()
        submission.graded_by = '2'

        gradedSubmissions.push({ ...submission, user: mockUsers.find((u) => u.id === submission.user_id) })
      }
    }
    return gradedSubmissions
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockSubmissions.findIndex((s) => s.id === id)
    if (index !== -1) {
      mockSubmissions.splice(index, 1)
    }
  },
}

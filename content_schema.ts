// ============================================
// ENUMS
// ============================================

export enum MediaKind {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export enum LessonSectionType {
  TEXT = 'TEXT',
  DIALOG = 'DIALOG',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  EXERCISE = 'EXERCISE',
}

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum MediaAssetOrderField {
  CREATED_AT = 'CREATED_AT',
  BYTES = 'BYTES',
}

export enum LessonOrderField {
  CREATED_AT = 'CREATED_AT',
  PUBLISHED_AT = 'PUBLISHED_AT',
  VERSION = 'VERSION',
}

export enum QuizOrderField {
  CREATED_AT = 'CREATED_AT',
  TOTAL_POINTS = 'TOTAL_POINTS',
}

export enum QuizQuestionOrderField {
  ORD = 'ORD',
  POINTS = 'POINTS',
}

export enum LessonSectionOrderField {
  ORD = 'ORD',
  CREATED_AT = 'CREATED_AT',
}

export enum FlashcardSetOrderField {
  CREATED_AT = 'CREATED_AT',
  CARD_COUNT = 'CARD_COUNT',
}

export enum FlashcardOrderField {
  ORD = 'ORD',
  CREATED_AT = 'CREATED_AT',
}

export enum ContentTagKind {
  LESSON = 'LESSON',
  QUIZ = 'QUIZ',
  FLASHCARD_SET = 'FLASHCARD_SET',
}

// ============================================
// BASIC TYPES
// ============================================

export interface Topic {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

export interface Level {
  id: string;
  code: string;
  name: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface MediaAsset {
  id: string;
  storageKey: string;
  kind: MediaKind;
  mimeType: string;
  folderId?: string;
  originalName: string;
  thumbnailURL?: string;
  bytes: number;
  durationMs?: number;
  sha256: string;
  createdAt: string;
  uploadedBy?: string;
  downloadURL: string;
}

export interface Lesson {
  id: string;
  code?: string;
  title: string;
  description?: string;
  topic?: Topic;
  level?: Level;
  isPublished: boolean;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags: Tag[];
  sections: LessonSection[];
}

export interface LessonSection {
  id: string;
  lessonId: string;
  ord: number;
  type: LessonSectionType;
  body: Record<string, any>;
  createdAt: string;
}

export interface Quiz {
  id: string;
  lessonId?: string;
  title: string;
  description?: string;
  totalPoints: number;
  timeLimitS?: number;
  createdAt: string;
  tags: Tag[];
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  ord: number;
  type: string;
  prompt: string;
  promptMedia?: string;
  points: number;
  metadata: any;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  ord: number;
  label: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  topicId?: string;
  levelId?: string;
  createdAt: string;
  createdBy?: string;
  tags: Tag[];
  cards: Flashcard[];
}

export interface Flashcard {
  id: string;
  setId: string;
  frontText: string;
  backText: string;
  frontMediaId?: string;
  backMediaId?: string;
  ord: number;
  hints: string[];
  createdAt: string;
}

export interface ContentTag {
  tagId: string;
  kind: ContentTagKind;
  objectId: string;
  tag?: Tag;
}

// ============================================
// COLLECTION TYPES
// ============================================

export interface MediaAssetCollection {
  items: MediaAsset[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface LessonCollection {
  items: Lesson[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface LessonSectionCollection {
  items: LessonSection[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface QuizCollection {
  items: Quiz[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface QuizQuestionCollection {
  items: QuizQuestion[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FlashcardSetList {
  items: FlashcardSet[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FlashcardCollection {
  items: Flashcard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ============================================
// INPUT TYPES (PAYLOADS)
// ============================================

export interface CreateTopicInput {
  slug: string;
  name: string;
}

export interface UpdateTopicInput {
  slug?: string;
  name?: string;
}

export interface CreateLevelInput {
  code: string;
  name: string;
}

export interface UpdateLevelInput {
  code?: string;
  name?: string;
}

export interface CreateTagInput {
  slug: string;
  name: string;
}

export interface UpdateTagInput {
  slug?: string;
  name?: string;
}

export interface MediaAssetFilterInput {
  folderId?: string;
  kind?: MediaKind;
  uploadedBy?: string;
  sha256?: string;
  search?: string;
}

export interface MediaAssetOrderInput {
  field?: MediaAssetOrderField;
  direction?: OrderDirection;
}

export interface UploadMediaInput {
  file: File;
  kind: MediaKind;
  mimeType: string;
  filename?: string;
  uploadedBy?: string;
  folderId?: string;
}

export interface CreateLessonInput {
  code?: string;
  title: string;
  description?: string;
  topicId?: string;
  levelId?: string;
  createdBy?: string;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  topicId?: string;
  levelId?: string;
}

export interface LessonFilterInput {
  topicId?: string;
  levelId?: string;
  isPublished?: boolean;
  search?: string;
  createdBy?: string;
}

export interface LessonOrderInput {
  field?: LessonOrderField;
  direction?: OrderDirection;
}

export interface CreateLessonSectionInput {
  type: LessonSectionType;
  body: Record<string, any>;
}

export interface UpdateLessonSectionInput {
  type?: LessonSectionType;
  body?: Record<string, any>;
}

export interface LessonSectionFilterInput {
  type?: LessonSectionType;
}

export interface LessonSectionOrderInput {
  field?: LessonSectionOrderField;
  direction?: OrderDirection;
}

export interface CreateQuizInput {
  lessonId?: string;
  topicId?: string;
  levelId?: string;
  title: string;
  description?: string;
  timeLimitS?: number;
}

export interface QuizOrderInput {
  field?: QuizOrderField;
  direction?: OrderDirection;
}

export interface CreateQuizQuestionInput {
  type: string;
  prompt: string;
  promptMedia?: string;
  points?: number;
  metadata?: any;
}

export interface QuizQuestionFilterInput {
  type?: string;
}

export interface QuizQuestionOrderInput {
  field?: QuizQuestionOrderField;
  direction?: OrderDirection;
}

export interface CreateQuestionOptionInput {
  ord: number;
  label: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface UpdateQuestionOptionInput {
  ord?: number;
  label?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface CreateFlashcardSetInput {
  title: string;
  description?: string;
  topicId?: string;
  levelId?: string;
  createdBy?: string;
}

export interface FlashcardSetFilterInput {
  topicId?: string;
  levelId?: string;
  createdBy?: string;
  search?: string;
}

export interface FlashcardSetOrderInput {
  field?: FlashcardSetOrderField;
  direction?: OrderDirection;
}

export interface AddFlashcardInput {
  setId: string;
  frontText: string;
  backText: string;
  frontMediaId?: string;
  backMediaId?: string;
  hints?: string[];
}

export interface FlashcardFilterInput {
  hasMedia?: boolean;
}

export interface FlashcardOrderInput {
  field?: FlashcardOrderField;
  direction?: OrderDirection;
}

export interface ContentTagInput {
  tagId: string;
  kind: ContentTagKind;
  objectId: string;
}

// ============================================
// QUERY VARIABLES
// ============================================

export interface GetTopicVariables {
  id?: string;
  slug?: string;
}

export interface GetTopicsVariables {
  search?: string;
}

export interface GetLevelVariables {
  id?: string;
  code?: string;
}

export interface GetLevelsVariables {
  search?: string;
}

export interface GetTagVariables {
  id?: string;
  slug?: string;
}

export interface GetTagsVariables {
  search?: string;
}

export interface GetMediaAssetVariables {
  id: string;
}

export interface GetMediaAssetsVariables {
  ids: string[];
}

export interface GetMediaAssetCollectionVariables {
  filter?: MediaAssetFilterInput;
  page?: number;
  pageSize?: number;
  orderBy?: MediaAssetOrderInput;
}

export interface GetLessonVariables {
  id: string;
}

export interface GetLessonByCodeVariables {
  code: string;
}

export interface GetLessonsVariables {
  filter?: LessonFilterInput;
  page?: number;
  pageSize?: number;
  orderBy?: LessonOrderInput;
}

export interface GetLessonSectionsVariables {
  lessonId: string;
  filter?: LessonSectionFilterInput;
  page?: number;
  pageSize?: number;
  orderBy?: LessonSectionOrderInput;
}

export interface GetQuizVariables {
  id: string;
}

export interface GetQuizzesVariables {
  lessonId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  orderBy?: QuizOrderInput;
}

export interface GetQuizQuestionsVariables {
  quizId: string;
  filter?: QuizQuestionFilterInput;
  page?: number;
  pageSize?: number;
  orderBy?: QuizQuestionOrderInput;
}

export interface GetFlashcardSetVariables {
  id: string;
}

export interface GetFlashcardSetsVariables {
  filter?: FlashcardSetFilterInput;
  page?: number;
  pageSize?: number;
  orderBy?: FlashcardSetOrderInput;
}

export interface GetFlashcardsVariables {
  setId: string;
  filter?: FlashcardFilterInput;
  page?: number;
  pageSize?: number;
  orderBy?: FlashcardOrderInput;
}

// ============================================
// MUTATION VARIABLES
// ============================================

export interface CreateTopicVariables {
  input: CreateTopicInput;
}

export interface UpdateTopicVariables {
  id: string;
  input: UpdateTopicInput;
}

export interface DeleteTopicVariables {
  id: string;
}

export interface CreateLevelVariables {
  input: CreateLevelInput;
}

export interface UpdateLevelVariables {
  id: string;
  input: UpdateLevelInput;
}

export interface DeleteLevelVariables {
  id: string;
}

export interface CreateTagVariables {
  input: CreateTagInput;
}

export interface UpdateTagVariables {
  id: string;
  input: UpdateTagInput;
}

export interface DeleteTagVariables {
  id: string;
}

export interface UploadMediaVariables {
  input: UploadMediaInput;
}

export interface DeleteMediaVariables {
  id: string;
}

export interface CreateLessonVariables {
  input: CreateLessonInput;
}

export interface UpdateLessonVariables {
  id: string;
  input: UpdateLessonInput;
}

export interface DeleteLessonVariables {
  id: string;
}

export interface PublishLessonVariables {
  id: string;
}

export interface UnpublishLessonVariables {
  id: string;
}

export interface CreateLessonSectionVariables {
  lessonId: string;
  input: CreateLessonSectionInput;
}

export interface UpdateLessonSectionVariables {
  id: string;
  input: UpdateLessonSectionInput;
}

export interface DeleteLessonSectionVariables {
  id: string;
}

export interface CreateFlashcardSetVariables {
  input: CreateFlashcardSetInput;
}

export interface AddFlashcardVariables {
  input: AddFlashcardInput;
}

export interface CreateQuizVariables {
  input: CreateQuizInput;
}

export interface AddQuizQuestionVariables {
  quizId: string;
  input: CreateQuizQuestionInput;
}

export interface AddQuestionOptionVariables {
  questionId: string;
  input: CreateQuestionOptionInput;
}

export interface UpdateQuestionOptionVariables {
  id: string;
  input: UpdateQuestionOptionInput;
}

export interface DeleteQuestionOptionVariables {
  id: string;
}

export interface AddContentTagVariables {
  input: ContentTagInput;
}

export interface RemoveContentTagVariables {
  input: ContentTagInput;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface HealthResponse {
  health: string;
}

export interface TopicResponse {
  topic: Topic | null;
}

export interface TopicsResponse {
  topics: Topic[];
}

export interface LevelResponse {
  level: Level | null;
}

export interface LevelsResponse {
  levels: Level[];
}

export interface TagResponse {
  tag: Tag | null;
}

export interface TagsResponse {
  tags: Tag[];
}

export interface MediaAssetResponse {
  mediaAsset: MediaAsset | null;
}

export interface MediaAssetsResponse {
  mediaAssets: MediaAsset[];
}

export interface MediaAssetCollectionResponse {
  mediaAssetCollection: MediaAssetCollection;
}

export interface LessonResponse {
  lesson: Lesson | null;
}

export interface LessonByCodeResponse {
  lessonByCode: Lesson | null;
}

export interface LessonsResponse {
  lessons: LessonCollection;
}

export interface LessonSectionsResponse {
  lessonSections: LessonSectionCollection;
}

export interface QuizResponse {
  quiz: Quiz | null;
}

export interface QuizzesResponse {
  quizzes: QuizCollection;
}

export interface QuizQuestionsResponse {
  quizQuestions: QuizQuestionCollection;
}

export interface FlashcardSetResponse {
  flashcardSet: FlashcardSet | null;
}

export interface FlashcardSetsResponse {
  flashcardSets: FlashcardSetList;
}

export interface FlashcardsResponse {
  flashcards: FlashcardCollection;
}

export interface CreateTopicResponse {
  createTopic: Topic;
}

export interface UpdateTopicResponse {
  updateTopic: Topic;
}

export interface DeleteTopicResponse {
  deleteTopic: boolean;
}

export interface CreateLevelResponse {
  createLevel: Level;
}

export interface UpdateLevelResponse {
  updateLevel: Level;
}

export interface DeleteLevelResponse {
  deleteLevel: boolean;
}

export interface CreateTagResponse {
  createTag: Tag;
}

export interface UpdateTagResponse {
  updateTag: Tag;
}

export interface DeleteTagResponse {
  deleteTag: boolean;
}

export interface UploadMediaResponse {
  uploadMedia: MediaAsset;
}

export interface DeleteMediaResponse {
  deleteMedia: boolean;
}

export interface CreateLessonResponse {
  createLesson: Lesson;
}

export interface UpdateLessonResponse {
  updateLesson: Lesson;
}

export interface DeleteLessonResponse {
  deleteLesson: boolean;
}

export interface PublishLessonResponse {
  publishLesson: Lesson;
}

export interface UnpublishLessonResponse {
  unpublishLesson: Lesson;
}

export interface CreateLessonSectionResponse {
  createLessonSection: LessonSection;
}

export interface UpdateLessonSectionResponse {
  updateLessonSection: LessonSection;
}

export interface DeleteLessonSectionResponse {
  deleteLessonSection: boolean;
}

export interface CreateFlashcardSetResponse {
  createFlashcardSet: FlashcardSet;
}

export interface AddFlashcardResponse {
  addFlashcard: Flashcard;
}

export interface CreateQuizResponse {
  createQuiz: Quiz;
}

export interface AddQuizQuestionResponse {
  addQuizQuestion: QuizQuestion;
}

export interface AddQuestionOptionResponse {
  addQuestionOption: QuestionOption;
}

export interface UpdateQuestionOptionResponse {
  updateQuestionOption: QuestionOption;
}

export interface DeleteQuestionOptionResponse {
  deleteQuestionOption: boolean;
}

export interface AddContentTagResponse {
  addContentTag: ContentTag;
}

export interface RemoveContentTagResponse {
  removeContentTag: boolean;
}
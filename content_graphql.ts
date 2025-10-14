import { gql } from '@apollo/client';

// ============================================
// QUERIES
// ============================================

export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`;

// Topics
export const GET_TOPICS = gql`
  query GetTopics($search: String) {
    topics(search: $search) {
      id
      slug
      name
      createdAt
    }
  }
`;

export const GET_TOPIC = gql`
  query GetTopic($id: ID, $slug: String) {
    topic(id: $id, slug: $slug) {
      id
      slug
      name
      createdAt
    }
  }
`;

// Levels
export const GET_LEVELS = gql`
  query GetLevels($search: String) {
    levels(search: $search) {
      id
      code
      name
    }
  }
`;

export const GET_LEVEL = gql`
  query GetLevel($id: ID, $code: String) {
    level(id: $id, code: $code) {
      id
      code
      name
    }
  }
`;

// Tags
export const GET_TAGS = gql`
  query GetTags($search: String) {
    tags(search: $search) {
      id
      slug
      name
    }
  }
`;

export const GET_TAG = gql`
  query GetTag($id: ID, $slug: String) {
    tag(id: $id, slug: $slug) {
      id
      slug
      name
    }
  }
`;

// Media Assets
export const GET_MEDIA_ASSET = gql`
  query GetMediaAsset($id: ID!) {
    mediaAsset(id: $id) {
      id
      storageKey
      kind
      mimeType
      folderId
      originalName
      thumbnailURL
      bytes
      durationMs
      sha256
      createdAt
      uploadedBy
      downloadURL
    }
  }
`;

export const GET_MEDIA_ASSETS = gql`
  query GetMediaAssets($ids: [ID!]!) {
    mediaAssets(ids: $ids) {
      id
      storageKey
      kind
      mimeType
      originalName
      thumbnailURL
      downloadURL
      bytes
      createdAt
    }
  }
`;

export const GET_MEDIA_ASSET_COLLECTION = gql`
  query GetMediaAssetCollection(
    $filter: MediaAssetFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: MediaAssetOrderInput
  ) {
    mediaAssetCollection(
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        storageKey
        kind
        mimeType
        originalName
        thumbnailURL
        downloadURL
        bytes
        durationMs
        createdAt
      }
      totalCount
      page
      pageSize
    }
  }
`;

// Lessons
export const GET_LESSON = gql`
  query GetLesson($id: ID!) {
    lesson(id: $id) {
      id
      code
      title
      description
      isPublished
      version
      createdBy
      createdAt
      updatedAt
      publishedAt
      topic {
        id
        slug
        name
      }
      level {
        id
        code
        name
      }
      tags {
        id
        slug
        name
      }
      sections {
        id
        ord
        type
        body
        createdAt
      }
    }
  }
`;

export const GET_LESSON_BY_CODE = gql`
  query GetLessonByCode($code: String!) {
    lessonByCode(code: $code) {
      id
      code
      title
      description
      isPublished
      version
      topic {
        id
        name
      }
      level {
        id
        name
      }
      tags {
        id
        name
      }
      sections {
        id
        ord
        type
        body
      }
    }
  }
`;

export const GET_LESSONS = gql`
  query GetLessons(
    $filter: LessonFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: LessonOrderInput
  ) {
    lessons(filter: $filter, page: $page, pageSize: $pageSize, orderBy: $orderBy) {
      items {
        id
        code
        title
        description
        isPublished
        version
        createdAt
        updatedAt
        publishedAt
        topic {
          id
          name
        }
        level {
          id
          name
        }
        tags {
          id
          name
        }
      }
      totalCount
      page
      pageSize
    }
  }
`;

export const GET_LESSON_SECTIONS = gql`
  query GetLessonSections(
    $lessonId: ID!
    $filter: LessonSectionFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: LessonSectionOrderInput
  ) {
    lessonSections(
      lessonId: $lessonId
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        lessonId
        ord
        type
        body
        createdAt
      }
      totalCount
      page
      pageSize
    }
  }
`;

// Quizzes
export const GET_QUIZ = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      lessonId
      topic {
        id
        name
      }
      level {
        id
        name
      }
      title
      description
      totalPoints
      timeLimitS
      createdAt
      tags {
        id
        slug
        name
      }
      questions {
        id
        quizId
        ord
        type
        prompt
        promptMedia
        points
        metadata
        options {
          id
          ord
          label
          isCorrect
          feedback
        }
      }
    }
  }
`;

export const GET_QUIZZES = gql`
  query GetQuizzes(
    $lessonId: ID
    $search: String
    $page: Int
    $pageSize: Int
    $orderBy: QuizOrderInput
  ) {
    quizzes(
      lessonId: $lessonId
      search: $search
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        lessonId
        topic {
          id
          name
        }
        level {
          id
          name
        }
        title
        description
        totalPoints
        timeLimitS
        createdAt
        tags {
          id
          slug
          name
        }
      }
      totalCount
      page
      pageSize
    }
  }
`;

export const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions(
    $quizId: ID!
    $filter: QuizQuestionFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: QuizQuestionOrderInput
  ) {
    quizQuestions(
      quizId: $quizId
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        quizId
        ord
        type
        prompt
        promptMedia
        points
        metadata
        options {
          id
          ord
          label
          isCorrect
          feedback
        }
      }
      totalCount
      page
      pageSize
    }
  }
`;

// Flashcards
export const GET_FLASHCARD_SET = gql`
  query GetFlashcardSet($id: ID!) {
    flashcardSet(id: $id) {
      id
      title
      description
      topicId
      levelId
      createdAt
      createdBy
      tags {
        id
        name
      }
      cards {
        id
        frontText
        backText
        frontMediaId
        backMediaId
        ord
        hints
        createdAt
      }
    }
  }
`;

export const GET_FLASHCARD_SETS = gql`
  query GetFlashcardSets(
    $filter: FlashcardSetFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: FlashcardSetOrderInput
  ) {
    flashcardSets(
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        title
        description
        topicId
        levelId
        createdAt
        tags {
          id
          name
        }
      }
      totalCount
      page
      pageSize
    }
  }
`;

export const GET_FLASHCARDS = gql`
  query GetFlashcards(
    $setId: ID!
    $filter: FlashcardFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: FlashcardOrderInput
  ) {
    flashcards(
      setId: $setId
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        setId
        frontText
        backText
        frontMediaId
        backMediaId
        ord
        hints
        createdAt
      }
      totalCount
      page
      pageSize
    }
  }
`;

// ============================================
// MUTATIONS
// ============================================

// Topics
export const CREATE_TOPIC = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      slug
      name
      createdAt
    }
  }
`;

export const UPDATE_TOPIC = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      slug
      name
      createdAt
    }
  }
`;

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`;

// Levels
export const CREATE_LEVEL = gql`
  mutation CreateLevel($input: CreateLevelInput!) {
    createLevel(input: $input) {
      id
      code
      name
    }
  }
`;

export const UPDATE_LEVEL = gql`
  mutation UpdateLevel($id: ID!, $input: UpdateLevelInput!) {
    updateLevel(id: $id, input: $input) {
      id
      code
      name
    }
  }
`;

export const DELETE_LEVEL = gql`
  mutation DeleteLevel($id: ID!) {
    deleteLevel(id: $id)
  }
`;

// Tags
export const CREATE_TAG = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      slug
      name
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
      id
      slug
      name
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

// Media
export const UPLOAD_MEDIA = gql`
  mutation UploadMedia($input: UploadMediaInput!) {
    uploadMedia(input: $input) {
      id
      storageKey
      kind
      mimeType
      originalName
      downloadURL
      thumbnailURL
      bytes
      createdAt
    }
  }
`;

export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`;

// Quizzes
export const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizInput!) {
    createQuiz(input: $input) {
      id
      lessonId
      topic {
        id
        name
      }
      level {
        id
        name
      }
      title
      description
      totalPoints
      timeLimitS
      createdAt
      tags {
        id
        slug
        name
      }
    }
  }
`;

export const UPDATE_QUIZ = gql`
  mutation UpdateQuiz($id: ID!, $input: UpdateQuizInput!) {
    updateQuiz(id: $id, input: $input) {
      id
      lessonId
      topic {
        id
        name
      }
      level {
        id
        name
      }
      title
      description
      totalPoints
      timeLimitS
      createdAt
      tags {
        id
        slug
        name
      }
      questions {
        id
        quizId
        ord
        type
        prompt
        promptMedia
        points
        metadata
        options {
          id
          ord
          label
          isCorrect
          feedback
        }
      }
    }
  }
`;

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;

export const ADD_QUIZ_QUESTION = gql`
  mutation AddQuizQuestion($quizId: ID!, $input: CreateQuizQuestionInput!) {
    addQuizQuestion(quizId: $quizId, input: $input) {
      id
      quizId
      ord
      type
      prompt
      promptMedia
      points
      metadata
      options {
        id
        ord
        label
        isCorrect
        feedback
      }
    }
  }
`;

export const ADD_QUESTION_OPTION = gql`
  mutation AddQuestionOption($questionId: ID!, $input: CreateQuestionOptionInput!) {
    addQuestionOption(questionId: $questionId, input: $input) {
      id
      questionId
      ord
      label
      isCorrect
      feedback
    }
  }
`;

export const UPDATE_QUESTION_OPTION = gql`
  mutation UpdateQuestionOption($id: ID!, $input: UpdateQuestionOptionInput!) {
    updateQuestionOption(id: $id, input: $input) {
      id
      questionId
      ord
      label
      isCorrect
      feedback
    }
  }
`;

export const DELETE_QUESTION_OPTION = gql`
  mutation DeleteQuestionOption($id: ID!) {
    deleteQuestionOption(id: $id)
  }
`;


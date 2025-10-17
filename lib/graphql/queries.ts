import { gql } from '@apollo/client'

// Folder queries and mutations
export const GET_FOLDER = gql`
  query GetFolder($id: ID!) {
    folder(id: $id) {
      id
      name
      parentId
      depth
      childrenCount
      mediaCount
      createdAt
      updatedAt
      parent {
        id
        name
      }
    }
  }
`

export const GET_ROOT_FOLDERS = gql`
  query GetRootFolders {
    rootFolders {
      id
      name
      depth
      childrenCount
      mediaCount
      createdAt
      updatedAt
    }
  }
`

export const GET_FOLDER_TREE = gql`
  query GetFolderTree($id: ID!) {
    folderTree(id: $id) {
      folder {
        id
        name
        depth
        mediaCount
      }
      children {
        folder {
          id
          name
          depth
          mediaCount
        }
        children {
          folder {
            id
            name
            depth
            mediaCount
          }
        }
      }
    }
  }
`

export const GET_FOLDER_PATH = gql`
  query GetFolderPath($id: ID!) {
    folderPath(id: $id) {
      id
      name
      depth
    }
  }
`

export const LIST_FOLDERS = gql`
  query ListFolders(
    $filter: FolderFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: FolderOrderInput
  ) {
    folders(filter: $filter, page: $page, pageSize: $pageSize, orderBy: $orderBy) {
      items {
        id
        name
        parentId
        depth
        childrenCount
        mediaCount
        createdAt
        updatedAt
      }
      totalCount
      page
      pageSize
    }
  }
`

export const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
      name
      parentId
      depth
      childrenCount
      mediaCount
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_FOLDER = gql`
  mutation UpdateFolder($id: ID!, $input: UpdateFolderInput!) {
    updateFolder(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`

export const DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`

// Topic queries and mutations
export const GET_TOPICS = gql`
  query GetTopics($search: String, $page: Int, $pageSize: Int) {
    topics(search: $search, page: $page, pageSize: $pageSize) {
      items {
        id
        slug
        name
        createdAt
      }
      totalCount
      page
      pageSize
    }
  }
`

export const CREATE_TOPIC = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      slug
      name
      createdAt
    }
  }
`

export const UPDATE_TOPIC = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      slug
      name
      createdAt
    }
  }
`

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`

// Level queries and mutations
export const GET_LEVELS = gql`
  query GetLevels($search: String, $page: Int, $pageSize: Int) {
    levels(search: $search, page: $page, pageSize: $pageSize) {
      items {
        id
        code
        name
      }
      totalCount
      page
      pageSize
    }
  }
`

export const CREATE_LEVEL = gql`
  mutation CreateLevel($input: CreateLevelInput!) {
    createLevel(input: $input) {
      id
      code
      name
    }
  }
`

export const UPDATE_LEVEL = gql`
  mutation UpdateLevel($id: ID!, $input: UpdateLevelInput!) {
    updateLevel(id: $id, input: $input) {
      id
      code
      name
    }
  }
`

export const DELETE_LEVEL = gql`
  mutation DeleteLevel($id: ID!) {
    deleteLevel(id: $id)
  }
`

// Tag queries and mutations
export const GET_TAGS = gql`
  query GetTags($search: String, $page: Int, $pageSize: Int) {
    tags(search: $search, page: $page, pageSize: $pageSize) {
      items {
        id
        slug
        name
      }
      totalCount
      page
      pageSize
    }
  }
`

export const CREATE_TAG = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      slug
      name
    }
  }
`

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
      id
      slug
      name
    }
  }
`

export const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`

// Media queries and mutations
export const GET_MEDIA_ASSETS = gql`
  query GetMediaAssets(
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
      totalCount
      page
      pageSize
    }
  }
`

export const UPLOAD_MEDIA = gql`
  mutation Upload($input: UploadMediaInput!) {
    uploadMedia(input: $input) {
      id
      originalName
      downloadURL
    }
  }
`

export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`

// Course queries and mutations
export const GET_COURSES = gql`
  query GetCourses(
    $filter: CourseFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: CourseOrderInput
  ) {
    courses(filter: $filter, page: $page, pageSize: $pageSize, orderBy: $orderBy) {
      items {
        id
        title
        description
        topicId
        levelId
        instructorId
        thumbnailURL
        isPublished
        isFeatured
        price
        durationHours
        averageRating
        reviewCount
        createdAt
        updatedAt
        publishedAt
        lessons {
          id
          lessonId
        }
        topic {
          id
          name
        }
        level {
          id
          name
        }
      }
      totalCount
      page
      pageSize
    }
  }
`

export const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      title
      description
      topicId
      levelId
      instructorId
      thumbnailURL
      isPublished
      isFeatured
      price
      durationHours
      averageRating
      reviewCount
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
      lessons {
        id
        courseId
        lessonId
        ord
        isRequired
        createdAt
        lesson {
          id
          title
          description
          isPublished
          topic {
            id
            name
          }
          level {
            id
            name
          }
        }
      }
    }
  }
`

export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      title
      description
      topicId
      levelId
      instructorId
      thumbnailURL
      isPublished
      isFeatured
      price
      durationHours
      averageRating
      reviewCount
      createdAt
      updatedAt
      publishedAt
      lessons {
        id
        lessonId
      }
    }
  }
`

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      title
      description
      topicId
      levelId
      instructorId
      thumbnailURL
      isPublished
      isFeatured
      price
      durationHours
      averageRating
      reviewCount
      createdAt
      updatedAt
      publishedAt
      lessons {
        id
        lessonId
      }
    }
  }
`

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`

export const PUBLISH_COURSE = gql`
  mutation PublishCourse($id: ID!) {
    publishCourse(id: $id) {
      id
      isPublished
      publishedAt
      updatedAt
    }
  }
`

export const UNPUBLISH_COURSE = gql`
  mutation UnpublishCourse($id: ID!) {
    unpublishCourse(id: $id) {
      id
      isPublished
      updatedAt
    }
  }
`

export const GET_COURSE_LESSONS = gql`
  query GetCourseLessons(
    $courseId: ID!
    $filter: CourseLessonFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: CourseLessonOrderInput
  ) {
    courseLessons(
      courseId: $courseId
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      items {
        id
        courseId
        lessonId
        ord
        isRequired
        createdAt
        lesson {
          id
          title
          description
          isPublished
          topic {
            id
            name
          }
          level {
            id
            name
          }
        }
      }
      totalCount
      page
      pageSize
    }
  }
`

export const ADD_COURSE_LESSON = gql`
  mutation AddCourseLesson($courseId: ID!, $input: AddCourseLessonInput!) {
    addCourseLesson(courseId: $courseId, input: $input) {
      id
      courseId
      lessonId
      ord
      isRequired
      createdAt
    }
  }
`

export const REMOVE_COURSE_LESSON = gql`
  mutation RemoveCourseLesson($id: ID!) {
    removeCourseLesson(id: $id)
  }
`

export const REORDER_COURSE_LESSONS = gql`
  mutation ReorderCourseLessons($courseId: ID!, $lessonIds: [ID!]!) {
    reorderCourseLessons(courseId: $courseId, lessonIds: $lessonIds) {
      id
      courseId
      lessonId
      ord
    }
  }
`

export const GET_COURSE_REVIEWS = gql`
  query GetCourseReviews($courseId: ID!, $page: Int, $pageSize: Int) {
    course(id: $courseId) {
      id
      averageRating
      reviewCount
      reviews(page: $page, pageSize: $pageSize) {
        items {
          id
          courseId
          userId
          rating
          comment
          createdAt
          updatedAt
        }
        totalCount
        page
        pageSize
      }
    }
  }
`

export const SUBMIT_COURSE_REVIEW = gql`
  mutation SubmitCourseReview($input: SubmitCourseReviewInput!) {
    submitCourseReview(input: $input) {
      id
      courseId
      userId
      rating
      comment
      createdAt
      updatedAt
    }
  }
`

export const DELETE_COURSE_REVIEW = gql`
  mutation DeleteCourseReview($courseId: ID!) {
    deleteCourseReview(courseId: $courseId)
  }
`

// Quiz queries and mutations
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
`

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
        topic { id }
        level { id }
        title
        description
        totalPoints
        timeLimitS
        createdAt
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
`

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
`

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizInput!) {
    createQuiz(input: $input) {
      id
      lessonId
      title
      description
      totalPoints
      timeLimitS
      topic {
        id
        name
      }
      level {
        id
        name
      }
      createdAt
      tags {
        id
        name
      }
    }
  }
`

export const UPDATE_QUIZ = gql`
  mutation UpdateQuiz($id: ID!, $input: UpdateQuizInput!) {
    updateQuiz(id: $id, input: $input) {
      id
      lessonId
      title
      description
      totalPoints
      timeLimitS
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
`

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`

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
`

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
`

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
`

export const DELETE_QUESTION_OPTION = gql`
  mutation DeleteQuestionOption($id: ID!) {
    deleteQuestionOption(id: $id)
  }
`

// Lesson queries and mutations
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
        createdAt
      }
    }
  }
`

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
        createdBy
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
`

export const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
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
  }
`

export const UPDATE_LESSON = gql`
  mutation UpdateLesson($id: ID!, $input: UpdateLessonInput!) {
    updateLesson(id: $id, input: $input) {
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
  }
`

export const PUBLISH_LESSON = gql`
  mutation PublishLesson($id: ID!) {
    publishLesson(id: $id) {
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
  }
`

export const UNPUBLISH_LESSON = gql`
  mutation UnpublishLesson($id: ID!) {
    unpublishLesson(id: $id) {
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
  }
`

export const DELETE_LESSON = gql`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`

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
`

export const CREATE_LESSON_SECTION = gql`
  mutation CreateLessonSection($lessonId: ID!, $input: CreateLessonSectionInput!) {
    createLessonSection(lessonId: $lessonId, input: $input) {
      id
      lessonId
      ord
      type
      body
      createdAt
    }
  }
`

export const UPDATE_LESSON_SECTION = gql`
  mutation UpdateLessonSection($id: ID!, $input: UpdateLessonSectionInput!) {
    updateLessonSection(id: $id, input: $input) {
      id
      lessonId
      ord
      type
      body
      createdAt
    }
  }
`

export const DELETE_LESSON_SECTION = gql`
  mutation DeleteLessonSection($id: ID!) {
    deleteLessonSection(id: $id)
  }
`

// Flashcard queries and mutations
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
        slug
        name
      }
      cards {
        id
        setId
        ord
      }
    }
  }
`

export const GET_FLASHCARD_SETS = gql`
  query GetFlashcardSets(
    $filter: FlashcardSetFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: FlashcardSetOrderInput
  ) {
    flashcardSets(filter: $filter, page: $page, pageSize: $pageSize, orderBy: $orderBy) {
      items {
        id
        title
        description
        topicId
        topic {
          id
          name
        }
        levelId
        level {
          id
          name
        }
        createdAt
        createdBy
        tags {
          id
          slug
          name
        }
        cards {
          id
          ord
        }
      }
      totalCount
      page
      pageSize
    }
  }
`

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
`

export const CREATE_FLASHCARD_SET = gql`
  mutation CreateFlashcardSet($input: CreateFlashcardSetInput!) {
    createFlashcardSet(input: $input) {
      id
      title
      description
      topicId
      levelId
      createdAt
      createdBy
      tags {
        id
        slug
        name
      }
      cards {
        id
        ord
      }
    }
  }
`

export const UPDATE_FLASHCARD_SET = gql`
  mutation UpdateFlashcardSet($id: ID!, $input: UpdateFlashcardSetInput!) {
    updateFlashcardSet(id: $id, input: $input) {
      id
      title
      description
      topicId
      levelId
      createdAt
      createdBy
      tags {
        id
        slug
        name
      }
      cards {
        id
        ord
      }
    }
  }
`

export const DELETE_FLASHCARD_SET = gql`
  mutation DeleteFlashcardSet($id: ID!) {
    deleteFlashcardSet(id: $id)
  }
`

export const ADD_FLASHCARD = gql`
  mutation AddFlashcard($input: AddFlashcardInput!) {
    addFlashcard(input: $input) {
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
  }
`

export const UPDATE_FLASHCARD = gql`
  mutation UpdateFlashcard($id: ID!, $input: UpdateFlashcardInput!) {
    updateFlashcard(id: $id, input: $input) {
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
  }
`

export const DELETE_FLASHCARD = gql`
  mutation DeleteFlashcard($id: ID!) {
    deleteFlashcard(id: $id)
  }
`

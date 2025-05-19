// src/graphql/mutations.ts
import { gql } from '@apollo/client'

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      isPublic
      isDraft
      createdAt
      category {
        id
        name
      }
      images {
        id
        url
        fileName
      }
      attachments {
        id
        url
        fileName
        fileType
        fileSize
      }
    }
  }
`
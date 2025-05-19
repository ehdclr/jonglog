import { gql } from "@apollo/client"

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      user {
        id
        email
        name
        role
        avatarUrl
        bio
      }
      accessToken
      success
      message
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      email
      name
      role
    }
  }
`

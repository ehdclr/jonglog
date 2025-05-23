import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      user {
        id
        email
        name
        role
      }
      accessToken
      success
      message
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      success
      message
      user {
        id
        email
        name
        role
        avatarUrl
      }
    }
  }
`;

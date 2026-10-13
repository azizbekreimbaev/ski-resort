import type { GraphQLFormattedError } from 'graphql';

export function formatGraphQLError(error: GraphQLFormattedError) {
  const extensions = error.extensions as
    | {
        code?: string;
        response?: { message?: string | string[] };
        exception?: { response?: { message?: string | string[] } };
      }
    | undefined;
  return {
    extensions: { code: extensions?.code },
    message:
      extensions?.exception?.response?.message ||
      extensions?.response?.message ||
      error.message,
  };
}

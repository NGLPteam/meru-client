const gql = require("@graphql-eslint/eslint-plugin");

module.exports = {
  files: ["*.graphql"],
  plugins: { "@graphql-eslint": gql },
  rules: {
    "@graphql-eslint/naming-convention": [
      "error",
      {
        VariableDefinition: "camelCase",
        OperationDefinition: {
          style: "PascalCase",
        },
        FragmentDefinition: {
          style: "PascalCase",
        },
      },
    ],
    "@graphql-eslint/no-one-place-fragments": ["off"],
  },
};

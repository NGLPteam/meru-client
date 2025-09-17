const gql = require("@graphql-eslint/eslint-plugin");
const relay = require("eslint-plugin-relay");

module.exports = {
  files: ["*.graphql"],
  plugins: { "@graphql-eslint": gql, relay },
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

module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: ["plugin:vue/essential", "@vue/prettier"],

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "vue/array-bracket-spacing": "error",
    "vue/arrow-spacing": "error",
    "vue/block-spacing": "error",
    "vue/brace-style": "error",
    "vue/camelcase": "error",
    "vue/comma-dangle": "error",
    "vue/component-name-in-template-casing": "error",
    "vue/dot-location": "error",
    "vue/eqeqeq": "error",
    "vue/key-spacing": "error",
    "vue/keyword-spacing": "error",
    "vue/no-boolean-default": "error",
    "vue/no-deprecated-scope-attribute": "error",
    "vue/no-empty-pattern": "error",
    "vue/no-restricted-syntax": "error",
    "vue/object-curly-spacing": "error",
    "vue/require-direct-export": "error",
    "vue/script-indent": "error",
    "vue/space-infix-ops": "error",
    "vue/space-unary-ops": "error",
    "vue/v-on-function-call": "error",
    "vue/v-slot-style": "error",
    "vue/valid-v-slot": "error",
    "vue/match-component-file-name": "error"
  },

  parserOptions: {
    parser: "babel-eslint"
  },

  extends: ["plugin:vue/recommended", "@vue/prettier"]
};

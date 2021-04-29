module.exports = {
  rules: {
    textlint: {
      option: {
        rules: [
          {
            ruleId: 'max-comma',
            rule: require('textlint-rule-max-comma').default,
          },
        ],
      },
    },
  },
}

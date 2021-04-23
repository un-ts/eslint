const fs = require('fs')

const MARKUPLINT = '@markuplint'

module.exports = {
  settings: {
    node: {
      allowModules: fs
        .readdirSync(`node_modules/${MARKUPLINT}`)
        .map(pkg => `${MARKUPLINT}/${pkg}`),
    },
  },
}

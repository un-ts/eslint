import fs from 'fs'

import { exec } from 'markuplint'

const handler = async () => {
  const filename = process.argv[2]
  const content = fs.readFileSync(filename, 'utf8')
  const options = (JSON.parse(content) as Parameters<typeof exec>)[0]
  const results = await exec(options)
  fs.writeFileSync(
    filename,
    JSON.stringify(
      results.map(
        ({ results, filePath, sourceCode, fixedCode, parser, locale }) => ({
          results,
          filePath,
          sourceCode,
          fixedCode,
          parser,
          locale,
        }),
      ),
    ),
  )
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
handler()

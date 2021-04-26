import { exec } from 'markuplint'
import { runAsWorker } from 'synckit'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runAsWorker(async options => {
  const results = await exec(options)
  return results.map(
    ({ results, filePath, sourceCode, fixedCode, parser, locale }) => ({
      results,
      filePath,
      sourceCode,
      fixedCode,
      parser,
      locale,
    }),
  )
})

import { exec } from 'markuplint'
import { runAsWorker } from 'synckit'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runAsWorker(async (options: Parameters<typeof exec>[0]) => {
  const results = await exec(options)
  return results.map(({ results, fixedCode }) => ({
    results,
    fixedCode,
  }))
})

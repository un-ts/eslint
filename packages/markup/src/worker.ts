import { MLEngine, type FromCodeOptions } from 'markuplint'
import { runAsWorker } from 'synckit'

export interface MarkupTarget extends Pick<FromCodeOptions, 'name'> {
  sourceCode: string
}

runAsWorker(async ({ name, sourceCode }: MarkupTarget, fix?: boolean) => {
  // `ignoreExt` is required: `mlTestFile` used to pass it to keep linting files
  // whose extension is not matched by the resolved config, e.g. virtual file
  // names crafted by ESLint processors. Without it `exec()` resolves to `null`
  // and the file silently passes.
  const engine = await MLEngine.fromCode(sourceCode, {
    name,
    ignoreExt: true,
    fix,
  })
  try {
    const result = await engine.exec()
    // `exec()` resolves to `null` when the target is not meant to be linted
    // (excluded by config, not a target file...), so there is nothing to report.
    return {
      violations: result?.violations ?? [],
      fixedCode: result?.fixedCode ?? sourceCode,
    }
  } finally {
    // the engine holds a file watcher and event listeners, release them eagerly
    await engine.close()
  }
})

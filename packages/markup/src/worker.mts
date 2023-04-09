import { Target } from '@markuplint/file-resolver'
import { mlTestFile } from 'markuplint'
import { runAsWorker } from 'synckit'

runAsWorker((target: Target, fix?: boolean) =>
  mlTestFile(target, undefined, undefined, undefined, fix),
)

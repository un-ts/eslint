import { runAsWorker } from 'synckit'

import { createMarkupPass } from './pass.js'

runAsWorker(createMarkupPass())

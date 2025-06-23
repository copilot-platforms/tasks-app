/**
 * This patch fixes a dynamic import being made in the XMLHttpRequest-impl.js file.
 * The dynamic import is used to load the xhr-sync-worker.js file, however esbuild being astatic
 * bundler cannot resolve the path to it.
 *
 * Basically, we resolve the path to the xhr-sync-worker.js file then monkey patch the code
 * to use that instead of the dynamic erquire.resolve way
 */
const fs = require('fs')
const path = require('path')

const filePath = path.resolve('node_modules/jsdom/lib/jsdom/living/xhr/XMLHttpRequest-impl.js')

const resolvedPath = require.resolve('jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js')

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) throw err

  const oldLine = /const\s+syncWorkerFile\s+=\s+require\.resolve\s+\?[^;]+;/
  const newLine = `const syncWorkerFile = "${resolvedPath}";`

  if (!oldLine.test(data)) {
    console.log('⚠️ Patch not applied: Pattern not found.')
    return
  }

  const updated = data.replace(oldLine, newLine)

  fs.writeFile(filePath, updated, 'utf8', (err) => {
    if (err) throw err
    console.log('✅ Patched XMLHttpRequest-impl.js with resolved syncWorker path.')
  })
})

import { readdirSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const isWindows = process.platform === 'win32'
const tscCommand = isWindows
  ? 'node_modules/.bin/tsc.cmd'
  : './node_modules/.bin/tsc'

try {
  run([tscCommand, ['-p', 'tsconfig.test.json']])
  run(['node', ['--test', ...findTestFiles('.tmp-tests')]])
} finally {
  rmSync('.tmp-tests', { force: true, recursive: true })
}

function run([command, args]) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function findTestFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      return findTestFiles(path)
    }

    return entry.isFile() && entry.name.endsWith('.test.js') ? [path] : []
  })
}

import { rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const isWindows = process.platform === 'win32'
const tscCommand = isWindows
  ? 'node_modules/.bin/tsc.cmd'
  : './node_modules/.bin/tsc'

try {
  run([tscCommand, ['-p', 'tsconfig.test.json']])
  run(['node', ['--test', '.tmp-tests/domain/model.test.js']])
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

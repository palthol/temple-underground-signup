import { execSync } from 'node:child_process'

const isLinuxX64 = process.platform === 'linux' && process.arch === 'x64'

if (!isLinuxX64) {
  process.exit(0)
}

const moduleName = '@rollup/rollup-linux-x64-gnu'

try {
  await import(moduleName)
} catch {
  console.log(`[build] Missing ${moduleName}; installing fallback...`)
  execSync(`npm i --no-save ${moduleName}`, { stdio: 'inherit' })
}

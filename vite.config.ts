import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getBasePath() {
  const repository = process.env.GITHUB_REPOSITORY

  if (!repository) {
    return '/'
  }

  const [, repoName] = repository.split('/')

  if (!repoName || repoName.endsWith('.github.io')) {
    return '/'
  }

  return `/${repoName}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
})

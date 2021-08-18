const modules = import.meta.glob('./docs/*.mdx')
// eslint-disable-next-line guard-for-in
for (const path in modules) {
  const normalizedPath = path
    .replace('./docs/', '')
    .replace('.mdx', '')
    .toLowerCase()
    .split(' ')
    .join('-')
  modules[normalizedPath] = modules[path]
  delete modules[path]
}

export { modules }

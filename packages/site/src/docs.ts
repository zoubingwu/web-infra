const modules = import.meta.glob('./docs/*.mdx')
// eslint-disable-next-line guard-for-in
for (const path in modules) {
  modules[path.replace('./docs/', '').replace('.mdx', '')] = modules[path]
  delete modules[path]
}

export { modules }

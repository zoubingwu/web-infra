const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export async function doctor() {
  await delay(2000)
  console.log('checking')
}

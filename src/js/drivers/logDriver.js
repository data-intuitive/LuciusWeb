function logDriver(stream$) {
  stream$.addListener({
    next: message => message.map(m => console.log(m)),
    error: e => console.error(e),
    complete: () => {}
  })
}

export { logDriver }
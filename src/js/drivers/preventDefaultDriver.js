function preventDefaultDriver(stream$) {
    stream$.subscribe({
        next: n => n.preventDefault(),
        error: e => console.error(e)
    })
}

export { preventDefaultDriver }
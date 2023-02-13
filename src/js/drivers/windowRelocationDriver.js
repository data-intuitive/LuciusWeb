function windowRelocationDriver(stream$) {
    stream$.subscribe({
        next: (url) => window.location.href = url,
        error: e => console.error(e)
    })
}

export { windowRelocationDriver }
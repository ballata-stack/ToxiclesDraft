 'use client';
export default function Error({reset}:{reset:()=>void}){return <main className="access-page"><div className="access-card"><h1>Back shortly.</h1><p>The gallery could not load.</p><button className="button" onClick={reset}>Try again</button></div></main>}

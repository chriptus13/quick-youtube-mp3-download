const fs = require('node:fs/promises')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')

async function downloadMusic(url, location) {
    try {
        console.log(`Downloading ${url} into '${location}'`)
        await fs.writeFile(location, ytdl(url, { filter: 'audioonly' }))
    } catch (err) {
        console.error(`Error downloading ${url} into '${location}' - ${err}`)
    }
}

function sanitize(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

async function main() {
    if (process.argv.length !== 3) {
        console.log(`Usage: node ${process.argv[1]} <youtubeUrl>`)
    }

    const url = new URL(process.argv[2])
    const isPlaylist = url.searchParams.has('list')

    if (isPlaylist) {
        const { title: playlistTitle, items } = await ytpl(url.href)
        console.log(`Downloading playlist ${playlistTitle} into folder ${playlistTitle}`)

        const sanitizedPlaylistTitle = sanitize(playlistTitle)

        await fs.mkdir(sanitizedPlaylistTitle).catch(_ => {/* ignored dir exists */})

        await Promise.all(items.map(({ title, shortUrl }) =>
            downloadMusic(shortUrl, `./${sanitizedPlaylistTitle}/${sanitize(title)}.mp3`)
        ))
    } else {
        const { videoDetails: { title } } = await ytdl.getInfo(url.href)
        await downloadMusic(url.href, `./${sanitize(title)}.mp3`)
    }
}

main()
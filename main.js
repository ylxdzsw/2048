// 0 1 2 3
// 4 5 6 7
// 8 9 a b
// c d e f
const row = x => x >> 2
const col = x => x & 0x03

function get_rand(rand, n) {
    while (true) {
        if (rand.i >= 8) {
            rand.state ^= rand.state << 13
            rand.state ^= rand.state >>> 17
            rand.state ^= rand.state << 5
            rand.i = 0
        }

        const r = rand.state >> (rand.i << 4) & 0x0f
        rand.i += 1

        if (r < n) {
            return r
        }
    }
}

class Tile {
    constructor(position, level=1) {
        this.position = position
        this.level = level
        this.tile = document.createElement('div')
        this.set_class()
        this.set_content()
        document.getElementById('tile-container').appendChild(this.tile)
    }

    set_class() {
        this.tile.setAttribute('class', `tile position-${row(this.position)+1}-${col(this.position)+1} color-${this.level+1}`)
    }

    set_content() {
        this.tile.textContent = 2 ** this.level
    }

    moveTo(position) {
        this.position = position
        this.set_class()
    }

    destroy(delay) {
        setTimeout(() => this.tile.parentNode.removeChild(this.tile), delay)
    }
}

const board = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
const tiles = []
const rand = { state: 42, i: 0 }

let nblock = 0
let ready = false

const generate_new = () => {
    let r = get_rand(rand, 16 - nblock)
    for (let i = 0; i < 16; i++) { // last loop can skip the branch
        if (board[i] == 0) {
            if (r == 0) {
                board[i] = 1
                tiles[i] = new Tile(i, 1)
                return nblock += 1
            } else {
                r--
            }
        }
    }
}

const move = (direction) => {
    if (direction == 0) {
        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let c = 4 * i + j

                if (board[c] != 0) {
                    let k = 1
                    let l = 0

                    while (true) {
                        let n = c - 4 * k

                        if (n < 0) {
                            board[l] = board[c]
                            board[c] = 0
                            tiles[c].moveTo(l)
                            tiles[l] = tiles[c]
                            tiles[c] = null
                        }

                        if (board[n] != 0) {
                            if (board[n] == board[c]) {
                                // merge
                            } else if (l == 0) {
                                // do nothing
                            } else {
                                // move to l
                            }
                        }

                        k++
                        l = n
                    }
                }
            }
        }
    } else if (direction == 1) {

    } else if (direction == 2) {

    } else {

    }
}

const keymap = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
}

document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener("keydown", e => {
        const modifiers = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
        var mapped = keymap[event.which]

        if (ready && !modifiers && mapped !== undefined) {
            e.preventDefault()
            move(mapped)
        }
    })

    document.getElementById('new-game').onclick = () => {
        generate_new()
    }
})

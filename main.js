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

function set_score() {
    document.getElementById('score').textContent = moves.length
}

function toHex(n) {
    n = n.toString(16)
    return n.length == 2 ? n : '0'+n
}

function encode_solution() {
    let result = ''
    let i = 0
    let c = 0

    for (let j of moves) {
        c |= j << i

        if (i >= 6) {
            result += toHex(c)
            c = i = 0
        } else {
            i += 2
        }
    }

    if (c != 0) {
        result += toHex(c)
    }

    return '0x' + result
}

class Tile {
    constructor(position, level=1) {
        this.position = position
        this.level = level
        this.tile = document.createElement('div')
        this.set_class('new')
        this.set_content()
        document.getElementById('tile-container').appendChild(this.tile)
    }

    set_class(c) {
        this.tile.setAttribute('class', `tile position-${row(this.position)+1}-${col(this.position)+1} color-${this.level+1} ${c?c:''}`)
    }

    set_content() {
        this.tile.textContent = 2 ** this.level
    }

    moveTo(position) {
        this.position = position
        this.set_class()
    }

    levelup(delay) {
        setTimeout(() => {
            this.level += 1
            this.set_class('merge')
            this.set_content()
            setTimeout(() => this.set_class(), 100)
        }, delay)
    }

    destroy(delay) {
        setTimeout(() => this.tile.parentNode.removeChild(this.tile), delay)
    }
}

const board = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
const tiles = []
const moves = []
const rand = { state: 39, i: 0 }

let nblock = 0
let ready = false
let beting = false
let contract = null

const generate_new = () => {
    let r = get_rand(rand, 16 - nblock)
    for (let i = 0; i < 16; i++) { // last loop can skip the branch
        if (board[i] == 0) {
            if (r == 0) {
                board[i] = 1
                tiles[i] = new Tile(i, 1)
                nblock += 1
                return set_score()
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
                            break
                        }

                        if (board[n] != 0) {
                            if (board[n] == board[c]) {
                                board[n] += 1
                                board[c] = 0
                                tiles[n].levelup(100)
                                tiles[c].moveTo(n)
                                tiles[c].destroy(100)
                                tiles[c] = null
                                nblock -= 1
                                set_score()
                            } else if (l != 0) {
                                board[l] = board[c]
                                board[c] = 0
                                tiles[c].moveTo(l)
                                tiles[l] = tiles[c]
                                tiles[c] = null
                            }
                            break
                        }

                        k++
                        l = n
                    }
                }
            }
        }
    } else if (direction == 1) {
        for (let i = 0; i < 4; i++) {
            for (let j = 2; j >= 0; j--) {
                let c = 4 * i + j

                if (board[c] != 0) {
                    let k = 1
                    let l = 0

                    while (true) {
                        let n = c + k

                        if (j + k > 3) {
                            board[l] = board[c]
                            board[c] = 0
                            tiles[c].moveTo(l)
                            tiles[l] = tiles[c]
                            tiles[c] = null
                            break
                        }

                        if (board[n] != 0) {
                            if (board[n] == board[c]) {
                                board[n] += 1
                                board[c] = 0
                                tiles[n].levelup(100)
                                tiles[c].moveTo(n)
                                tiles[c].destroy(100)
                                tiles[c] = null
                                nblock -= 1
                                set_score()
                            } else if (l != 0) {
                                board[l] = board[c]
                                board[c] = 0
                                tiles[c].moveTo(l)
                                tiles[l] = tiles[c]
                                tiles[c] = null
                            }
                            break
                        }

                        k++
                        l = n
                    }
                }
            }
        }
    } else if (direction == 2) {
        for (let i = 2; i >= 0; i--) {
            for (let j = 0; j < 4; j++) {
                let c = 4 * i + j

                if (board[c] != 0) {
                    let k = 1
                    let l = 0

                    while (true) {
                        let n = c + 4 * k

                        if (i + k > 3) {
                            board[l] = board[c]
                            board[c] = 0
                            tiles[c].moveTo(l)
                            tiles[l] = tiles[c]
                            tiles[c] = null
                            break
                        }

                        if (board[n] != 0) {
                            if (board[n] == board[c]) {
                                board[n] += 1
                                board[c] = 0
                                tiles[n].levelup(100)
                                tiles[c].moveTo(n)
                                tiles[c].destroy(100)
                                tiles[c] = null
                                nblock -= 1
                                set_score()
                            } else if (l != 0) {
                                board[l] = board[c]
                                board[c] = 0
                                tiles[c].moveTo(l)
                                tiles[l] = tiles[c]
                                tiles[c] = null
                            }
                            break
                        }

                        k++
                        l = n
                    }
                }
            }
        }
    } else {
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                let c = 4 * i + j

                if (board[c] != 0) {
                    let k = 1
                    let l = 0

                    while (true) {
                        let n = c - k

                        if (j - k < 0) {
                            board[l] = board[c]
                            board[c] = 0
                            tiles[c].moveTo(l)
                            tiles[l] = tiles[c]
                            tiles[c] = null
                            break
                        }

                        if (board[n] != 0) {
                            if (board[n] == board[c]) {
                                board[n] += 1
                                board[c] = 0
                                tiles[n].levelup(100)
                                tiles[c].moveTo(n)
                                tiles[c].destroy(100)
                                tiles[c] = null
                                nblock -= 1
                                set_score()
                            } else if (l != 0) {
                                board[l] = board[c]
                                board[c] = 0
                                tiles[c].moveTo(l)
                                tiles[l] = tiles[c]
                                tiles[c] = null
                            }
                            break
                        }

                        k++
                        l = n
                    }
                }
            }
        }
    }

    if (nblock == 16) {
        gameover()
    } else {
        moves.push(direction)
        generate_new()
    }
}

const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "time",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "seed",
				"type": "uint32"
			}
		],
		"name": "Game",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "refund",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "score",
				"type": "uint16"
			}
		],
		"name": "Score",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "start_game",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "time",
				"type": "uint256"
			},
			{
				"name": "score",
				"type": "uint16"
			},
			{
				"name": "solution",
				"type": "bytes"
			}
		],
		"name": "submit",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "scores",
		"outputs": [
			{
				"name": "",
				"type": "uint16"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]

const gamestart = (online) => {
    board.fill(0)
    tiles.map(x => x && x.destroy())
    tiles.length = 0
    moves.length = 0
    rand.state = (2 ** 32) * Math.random() >>> 0
    rand.i = 0
    nblock = 0

    if (online) {
        if (!contract) {
            if (web3) {
                web3 = new Web3(web3.currentProvider)
            } else {
                alert('Install Metamask')
            }

            contract = web3.eth.contract(abi).at(todo())

        }
        
        beting = true
        try {
            contract.start_game()
        } catch {
            todo()
        }

        contract.Game({player: todo()}, (error, result) => {

        })
    } else {
        ready = true
        generate_new()
    }
}

const gameover = () => {
    ready = false
    console.log(encode_solution())
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

    document.getElementById('new-game-online').onclick = () => {
        gamestart(true)
    }

    document.getElementById('new-game-offline').onclick = () => {
        gamestart(false)
    }
})

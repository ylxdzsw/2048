pragma solidity ^0.4.21;

contract D2048 {
    // 0: never, 1~10000: score, 65535: playing
    mapping(bytes32 => uint16) public scores;

    event Game(address player, uint time, uint32 seed);
    event Score(address player, uint time, uint16 score);

    struct Random {
        uint32 state;
        uint8 i;
    }

    function start_game() payable public {
        require(msg.value >= 1 ether);
        bytes32 seed = keccak256(now, msg.sender);
        require(scores[seed] == 0);
        scores[seed] = 255;
        emit Game(msg.sender, now, uint32(seed));
    }

    function submit(uint time, uint16 score, bytes solution) public {
        bytes32 seed = keccak256(time, msg.sender);
        require(scores[seed] == 255);

        validate_solution(uint32(seed), score, solution);
        scores[seed] = score;

        msg.sender.transfer(uint(score) * 1 finney);

        emit Score(msg.sender, time, score);
    }

    function validate_solution(uint32 seed, uint16 score, bytes solution) pure internal {
        Random memory rand = Random(seed, 0);
        uint8[16] memory board = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];

        uint8 nblock = 0;

        uint16 si = 0;
        for (uint8 s = 0; s < score; s++) {
            require(nblock < 16);

            uint16 r = get_rand(rand, 16 - nblock);
            for (uint8 i = 0; i < 16; i++) {
                if (board[i] == 0) {
                    if (r == 0) {
                        board[i] = 1;
                        nblock += 1;
                        break;
                    } else {
                        r--;
                    }
                }
            }

            uint8 direction = uint8((solution[s>>2] >> si) & 0x03);
            nblock -= move(board, direction);

            si = si >= 3 ? 0 : si + 1;
        }
    }

    function move(uint8[16] board, uint8 direction) pure internal returns (uint8 nmerge) {
        uint8 i;
        uint8 j;
        uint8 k;
        uint8 c;
        uint8 n;
        uint8 l;

        nmerge = 0;

        if (direction == 0) {
            for (i = 1; i < 4; i++) {
                for (j = 0; j < 4; j++) {
                    c = 4 * i + j;

                    if (board[c] != 0) {
                        k = 1;
                        l = 0;

                        while (true) {
                            n = c - 4 * k;

                            if (n > 128) { // n < 0
                                board[l] = board[c];
                                board[c] = 0;
                                break;
                            }

                            if (board[n] != 0) {
                                if (board[n] == board[c]) {
                                    board[n] += 1;
                                    board[c] = 0;
                                    nmerge += 1;
                                } else if (l != 0) {
                                    board[l] = board[c];
                                    board[c] = 0;
                                }
                                break;
                            }

                            k++;
                            l = n;
                        }
                    }
                }
            }
        } else if (direction == 1) {
            for (i = 0; i < 4; i++) {
                for (j = 2; j < 128; j--) { // j >= 0
                    c = 4 * i + j;

                    if (board[c] != 0) {
                        k = 1;
                        l = 0;

                        while (true) {
                            n = c + k;

                            if (j + k > 3) {
                                board[l] = board[c];
                                board[c] = 0;
                                break;
                            }

                            if (board[n] != 0) {
                                if (board[n] == board[c]) {
                                    board[n] += 1;
                                    board[c] = 0;
                                    nmerge += 1;
                                } else if (l != 0) {
                                    board[l] = board[c];
                                    board[c] = 0;
                                }
                                break;
                            }

                            k++;
                            l = n;
                        }
                    }
                }
            }
        } else if (direction == 2) {
            for (i = 2; i < 128; i--) { // i >= 0
                for (j = 0; j < 4; j++) {
                    c = 4 * i + j;

                    if (board[c] != 0) {
                        k = 1;
                        l = 0;

                        while (true) {
                            n = c + 4 * k;

                            if (i + k > 3) {
                                board[l] = board[c];
                                board[c] = 0;
                                break;
                            }

                            if (board[n] != 0) {
                                if (board[n] == board[c]) {
                                    board[n] += 1;
                                    board[c] = 0;
                                    nmerge += 1;
                                } else if (l != 0) {
                                    board[l] = board[c];
                                    board[c] = 0;
                                }
                                break;
                            }

                            k++;
                            l = n;
                        }
                    }
                }
            }
        } else {
            for (i = 0; i < 4; i++) {
                for (j = 1; j < 4; j++) {
                    c = 4 * i + j;

                    if (board[c] != 0) {
                        k = 1;
                        l = 0;

                        while (true) {
                            n = c - k;

                            if (j - k > 128) { // j - k < 0
                                board[l] = board[c];
                                board[c] = 0;
                                break;
                            }

                            if (board[n] != 0) {
                                if (board[n] == board[c]) {
                                    board[n] += 1;
                                    board[c] = 0;
                                    nmerge += 1;
                                } else if (l != 0) {
                                    board[l] = board[c];
                                    board[c] = 0;
                                }
                                break;
                            }

                            k++;
                            l = n;
                        }
                    }
                }
            }
        }
    }

    function get_rand(Random rand, uint8 n) pure internal returns (uint16) {
        // assert(n <= 16)
        while (true) {
            if (rand.i >= 8) {
                rand.state = xorshift32(rand.state);
                rand.i = 0;
            }

            uint8 r = uint8(rand.state >> (rand.i << 4)) & 0x0f;
            rand.i += 1;
            
            if (r < n) {
                return r;
            }
        }
    }

    function xorshift32(uint32 state) pure internal returns (uint32 x) {
        x = state;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
    }

    function refund(uint amount) public returns (string) {
        require(msg.sender == 0xBBCf8d0E80320F368bc541EEE9797d3BfF6b2D85);
        msg.sender.transfer(amount);
        return "remember to use them for good, not evil.";
    }

    function () public payable {}
}
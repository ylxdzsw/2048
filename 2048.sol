pragma solidity ^0.4.21;

contract D2048 {
    // 0: never, 1~16: score, 255: playing
    mapping(bytes32 => uint8) public scores;

    event Game(address player, uint time);
    event Score(address player, uint8 score);

    struct Random {
        uint32 state;
        uint8 i;
    }

    function start_game() payable public {
        require(msg.value >= 1 ether);
        bytes32 seed = keccak256(now, msg.sender);
        require(scores[seed] == 0);
        scores[seed] = 255;
        emit Game(msg.sender, now);
    }

    function submit(uint time, bytes solution) public {
        bytes32 seed = keccak256(time, msg.sender);
        require(scores[seed] == 255);

        uint8 score = validate_solution(uint32(seed), solution);
        scores[seed] = score;

        msg.sender.transfer(2 ** uint(score) * 10 finney);

        emit Score(msg.sender, score);
    }

    function validate_solution(uint32 seed, bytes solution) pure internal returns (uint8) {
        // Random storage rand = Random(seed, 0);
        // uint8[] board = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    }

    function get_rand(Random storage rand, uint8 n) internal returns (uint16) {
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

    function xorshift32(uint32 state) pure internal returns (uint32) {
        uint32 x = state;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return x;
    }

    function refund(uint amount) public returns (string) {
        require(msg.sender == 0xBBCf8d0E80320F368bc541EEE9797d3BfF6b2D85);
        msg.sender.transfer(amount);
        return "remember to use them for good, not evil.";
    }
}
const OPENINGS = {
    "Ruy Lopez": {
        "player_colour": WHITE,
        "moves": [
            {"src": "e2", "dest": "e4"},
            {"src": "e7", "dest": "e5"},
            {"src": "g1", "dest": "f3"},
            {"src": "b8", "dest": "c6"},
            {"src": "f1", "dest": "b5"}
        ]
    },
    "King's Indian Attack": {
        "player_colour": WHITE,
        "moves": [
            {"src": "e2", "dest": "e4"},
            {"src": "e7", "dest": "e6"},
            {"src": "d2", "dest": "d3"},
            {"src": "d7", "dest": "d5"},
            {"src": "b1", "dest": "d2"},
            {"src": "g8", "dest": "f6"},
            {"src": "g1", "dest": "f3"},
            {"src": "c7", "dest": "c5"},
            {"src": "g2", "dest": "g3"},
            {"src": "b8", "dest": "c6"},
            {"src": "f1", "dest": "g2"},
            {"src": "f8", "dest": "e7"},
            {"src": "e1", "dest": "g1", "castle_move": {"src": "h1", "dest": "f1"}},
            {"src": "e8", "dest": "g8", "castle_move": {"src": "h8", "dest": "f8"}},
        ]
    },
    "Capturing test": {
        "player_colour": BLACK,
        "moves": [
            {"src": "a2", "dest": "a4"},
            {"src": "b7", "dest": "b5"},
            {"src": "a4", "dest": "b5"},
            {"src": "h7", "dest": "h5"},
            {"src": "g2", "dest": "g4"},
            {"src": "h5", "dest": "g4"},
        ]
    },
};

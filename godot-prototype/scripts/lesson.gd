extends RefCounted

# IDs and translations are copied from the existing a1-drinks dictionary.
const WORDS: Array[Dictionary] = [
    {"id": "a1-drinks-water", "en": "water", "uk": "вода", "atlas": "painted-11.webp", "cell": 0},
    {"id": "a1-drinks-tea", "en": "tea", "uk": "чай", "atlas": "cottage-2.jpg", "region": Rect2(280.5, 982, 236, 236)},
    {"id": "a1-drinks-coffee", "en": "coffee", "uk": "кава", "atlas": "painted-05.webp", "cell": 23},
    {"id": "a1-drinks-milk", "en": "milk", "uk": "молоко", "atlas": "painted-05.webp", "cell": 1}
]

var found: Dictionary = {}
var selected_kind: String = ""
var selected_id: int = -1
var mistakes: int = 0
var pictures: Array[int] = [0, 1, 2, 3]
var words: Array[int] = [0, 1, 2, 3]

func _init(seed_value: int = -1) -> void:
    var rng := RandomNumberGenerator.new()
    if seed_value < 0:
        rng.randomize()
    else:
        rng.seed = seed_value
    _shuffle(pictures, rng)
    _shuffle(words, rng)
    # A pair never starts in the same row; both columns still share one style.
    for attempt in range(32):
        var aligned := false
        for i in range(4):
            if pictures[i] == words[i]:
                aligned = true
        if not aligned:
            return
        _shuffle(words, rng)
    words.assign([pictures[1], pictures[2], pictures[3], pictures[0]])

func _shuffle(items: Array[int], rng: RandomNumberGenerator) -> void:
    for i in range(items.size() - 1, 0, -1):
        var other := rng.randi_range(0, i)
        var old: int = items[i]
        items[i] = items[other]
        items[other] = old

func choose(kind: String, word_index: int) -> String:
    if kind not in ["picture", "word"] or word_index < 0 or word_index >= WORDS.size() or found.has(word_index):
        return "ignored"
    if selected_kind == kind and selected_id == word_index:
        selected_kind = ""
        selected_id = -1
        return "deselected"
    if selected_kind == "" or selected_kind == kind:
        selected_kind = kind
        selected_id = word_index
        return "selected"
    var correct: bool = selected_id == word_index
    selected_kind = ""
    selected_id = -1
    if not correct:
        mistakes += 1
        return "wrong"
    found[word_index] = true
    return "complete" if found.size() == WORDS.size() else "matched"

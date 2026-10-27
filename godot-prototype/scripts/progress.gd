extends RefCounted

const SAVE_PATH := "user://word-cottage-godot-prototype-v1.json"
var save_path: String = SAVE_PATH
var rounds: int = 0
var storage_ok: bool = true

func _init(path_value: String = SAVE_PATH) -> void:
    save_path = path_value

func restore(value: Variant) -> void:
    rounds = 0
    if value is Dictionary and value.get("version") == 1:
        var saved: Variant = value.get("rounds", 0)
        if saved is float or saved is int:
            if is_finite(float(saved)):
                rounds = clampi(int(saved), 0, 3)

func leaves() -> int:
    return rounds * 4

func complete_round() -> bool:
    if rounds >= 3:
        return false
    rounds += 1
    return true

func load_save() -> void:
    if FileAccess.file_exists(save_path):
        var file := FileAccess.open(save_path, FileAccess.READ)
        if file:
            restore(JSON.parse_string(file.get_as_text()))
        else:
            storage_ok = false

func save() -> bool:
    var file := FileAccess.open(save_path, FileAccess.WRITE)
    if file == null:
        storage_ok = false
        return false
    file.store_string(JSON.stringify({"version": 1, "rounds": rounds}))
    file.flush()
    storage_ok = file.get_error() == OK
    return storage_ok

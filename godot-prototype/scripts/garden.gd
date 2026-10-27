extends Control

signal plot_pressed

var stage: int = 0
var phase: float = 0.0
var reveal: float = 1.0
var artwork: Texture2D

func _ready() -> void:
    artwork = load("res://assets/garden.webp")
    mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND

func _process(delta: float) -> void:
    phase += delta
    queue_redraw()

func _gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
        plot_pressed.emit()
        accept_event()

func grow_in() -> void:
    reveal = 0.0
    create_tween().tween_property(self, "reveal", 1.0, 0.8).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _draw() -> void:
    if artwork:
        draw_texture_rect(artwork, Rect2(Vector2.ZERO, size), false)
    if stage == 0:
        return
    # The flower is live Godot geometry, layered onto the empty soil artwork.
    var center := Vector2(size.x * 0.36, size.y * 0.69)
    var factor: float = size.x / 660.0
    _plant(center, factor, stage)
    if stage >= 2:
        _plant(center + Vector2(-67, -17) * factor, factor * 0.68, stage - 1)
        _plant(center + Vector2(65, -12) * factor, factor * 0.68, stage - 1)

func _plant(origin: Vector2, factor: float, level: int) -> void:
    var scale_value: float = factor * maxf(reveal, 0.01)
    var sway: float = sin(phase * 1.6 + origin.x) * 3.0
    draw_set_transform(origin, 0.0, Vector2(scale_value, scale_value))
    _ellipse(Vector2(0, 5), Vector2(28, 8), Color(0.16, 0.12, 0.05, 0.24))
    var height_value: float = 38.0 if level == 1 else 65.0 if level == 2 else 88.0
    var tip := Vector2(sway, -height_value)
    draw_line(Vector2.ZERO, tip, Color("476632"), 6.0, true)
    _leaf(Vector2(-2, -18), -1.0, 24.0)
    _leaf(Vector2(2, -24), 1.0, 27.0)
    if level >= 2:
        _leaf(Vector2(0, -43), -1.0, 31.0)
        _leaf(Vector2(0, -53), 1.0, 28.0)
    if level == 3:
        for i in range(9):
            var angle: float = TAU * i / 9.0
            draw_circle(tip + Vector2(cos(angle), sin(angle)) * 19, 12, Color("d5a344"))
            draw_circle(tip + Vector2(cos(angle), sin(angle)) * 17 + Vector2(-1, -2), 10, Color("f7c85c"))
        draw_circle(tip + Vector2(1, 2), 15, Color("795127"))
        draw_circle(tip, 12, Color("a57433"))
        draw_circle(tip + Vector2(-4, -4), 4, Color("cda05d"))
    draw_set_transform(Vector2.ZERO)

func _leaf(origin: Vector2, side: float, length_value: float) -> void:
    var end := origin + Vector2(side * length_value, -length_value * 0.65)
    var points := PackedVector2Array([origin, origin + Vector2(side * 9, -20), end, origin + Vector2(side * 19, -1)])
    draw_colored_polygon(points, Color("639136"))
    draw_line(origin, end, Color("b0c85e"), 2, true)

func _ellipse(center: Vector2, radius: Vector2, color: Color) -> void:
    var points := PackedVector2Array()
    for i in range(32):
        var angle: float = TAU * i / 32.0
        points.append(center + Vector2(cos(angle), sin(angle)) * radius)
    draw_colored_polygon(points, color)

extends Control

const Lesson = preload("res://scripts/lesson.gd")
const Progress = preload("res://scripts/progress.gd")
const Garden = preload("res://scripts/garden.gd")
const CREAM := Color("faf6ec")
const INK := Color("34442f")
const MUTED := Color("707760")
const OLIVE := Color("596e3c")
const RUST := Color("9a5239")
const PAPER := Color("fffcf3")
const BORDER := Color("ded3b9")
const GOLD := Color("c89b41")
const GREEN := Color("dfead0")
const RED := Color("f5ded3")

var progress = Progress.new()
var lesson = Lesson.new()
var page: VBoxContainer
var page_host: MarginContainer
var screen: String = ""
var card_buttons: Array[Button] = []
var feedback: Label
var pair_count: Label
var pair_bar: ProgressBar
var locked: bool = false
var round_serial: int = 0
var last_reward: bool = false
var textures: Array[AtlasTexture] = []

func _ready() -> void:
    Engine.max_fps = 30
    var palette := Theme.new()
    palette.default_font_size = 28
    palette.set_color("font_color", "Label", INK)
    theme = palette
    var background := ColorRect.new()
    background.color = CREAM
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    background.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(background)
    page_host = MarginContainer.new()
    page_host.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    for side in ["left", "right"]:
        page_host.add_theme_constant_override("margin_" + side, 30)
    page_host.add_theme_constant_override("margin_top", 24)
    page_host.add_theme_constant_override("margin_bottom", 24)
    add_child(page_host)
    _resize_margins()
    _load_textures()
    progress.load_save()
    _show_garden()

func _load_textures() -> void:
    for word in Lesson.WORDS:
        var texture := AtlasTexture.new()
        texture.atlas = load("res://assets/" + word.atlas)
        if word.has("region"):
            texture.region = word.region
        else:
            var cell_size: float = float(texture.atlas.get_width()) / 5.0
            var cell: int = word.cell
            texture.region = Rect2((cell % 5) * cell_size + 8, (cell / 5) * cell_size + 8, cell_size - 16, cell_size - 16)
        textures.append(texture)

func _new_page(name_value: String) -> void:
    _stop_audio()
    round_serial += 1
    locked = false
    screen = name_value
    card_buttons.clear()
    if page:
        page_host.remove_child(page)
        page.queue_free()
    page = VBoxContainer.new()
    page.add_theme_constant_override("separation", 12)
    page_host.add_child(page)
    var header := HBoxContainer.new()
    header.add_theme_constant_override("separation", 16)
    page.add_child(header)
    var brand := _label("Word Cottage", 36, RUST)
    brand.autowrap_mode = TextServer.AUTOWRAP_OFF
    brand.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    header.add_child(brand)
    if name_value != "garden":
        var back := _button("Сад", _show_garden, false, 62)
        back.custom_minimum_size.x = 140
        header.add_child(back)
    else:
        var badge := _panel(Color("e9eddb"), Color("d4dbc0"))
        badge.custom_minimum_size.x = 190
        header.add_child(badge)
        var leaves_label := _label("%s листків" % progress.leaves(), 24, OLIVE, true)
        leaves_label.autowrap_mode = TextServer.AUTOWRAP_OFF
        badge.add_child(leaves_label)
    _gap(page, 8)

func _show_garden() -> void:
    _new_page("garden")
    page.add_child(_label("Мій сад слів", 50, RUST))
    page.add_child(_label("Вивчай англійську. Вирощуй свій маленький світ.", 24, MUTED))
    var garden = Garden.new()
    garden.stage = progress.rounds
    garden.custom_minimum_size = Vector2(0, 440)
    garden.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    garden.plot_pressed.connect(_show_intro)
    page.add_child(garden)
    garden.grow_in()

    var growth_panel := _panel(PAPER, BORDER)
    var growth := _panel_content(growth_panel, 12)
    page.add_child(growth_panel)
    var names: Array[String] = ["Грядка чекає на перше слово", "Твій перший паросток!", "З’явилися нові листочки", "Соняшник розквітнув!"]
    growth.add_child(_label(names[progress.rounds], 28, INK, true))
    var steps := HBoxContainer.new()
    steps.alignment = BoxContainer.ALIGNMENT_CENTER
    steps.add_theme_constant_override("separation", 16)
    growth.add_child(steps)
    for i in range(4):
        var step := _label(["Зернятко", "Паросток", "Листя", "Квітка"][i], 20, OLIVE if i <= progress.rounds else MUTED, true)
        step.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        steps.add_child(step)
    var bar := _progress_bar(3, progress.rounds)
    growth.add_child(bar)

    var quest_panel := _panel(Color("f0eedf"), Color("dedac0"))
    var quest := _panel_content(quest_panel, 12)
    quest.add_theme_constant_override("separation", 8)
    page.add_child(quest_panel)
    quest.add_child(_label("Drinks and Beverages", 34, INK))
    quest.add_child(_label("напої · 4 слова · знайди пару", 24, MUTED))
    var button_text := "Вивчити 4 слова" if progress.rounds == 0 else "Полити сад — зіграти ще" if progress.rounds < 3 else "Потренувати слова"
    quest.add_child(_button(button_text, _show_intro, true, 84))
    _spacer(page)
    page.add_child(_label("Три завершені раунди — і соняшник розквітне.\nБез таймера та штрафів за помилки.", 22, MUTED, true))
    if not progress.storage_ok:
        page.add_child(_label("Прогрес поки не вдалося зберегти на цьому пристрої.", 22, RUST, true))
    _announce("Сад. Ріст %s з 3. %s листків." % [progress.rounds, progress.leaves()])

func _show_intro() -> void:
    _new_page("intro")
    page.add_child(_label("Спершу познайомимось", 46, RUST))
    page.add_child(_label("Поглянь на малюнки та послухай слова.", 27, MUTED))
    for i in range(Lesson.WORDS.size()):
        var word: Dictionary = Lesson.WORDS[i]
        var panel := _panel(PAPER, BORDER)
        page.add_child(panel)
        var margin := MarginContainer.new()
        for side in ["left", "right", "top", "bottom"]:
            margin.add_theme_constant_override("margin_" + side, 12)
        panel.add_child(margin)
        var row := HBoxContainer.new()
        row.add_theme_constant_override("separation", 22)
        margin.add_child(row)
        var picture := TextureRect.new()
        picture.texture = textures[i]
        picture.custom_minimum_size = Vector2(130, 130)
        picture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
        picture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
        row.add_child(picture)
        var text := VBoxContainer.new()
        text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        text.alignment = BoxContainer.ALIGNMENT_CENTER
        row.add_child(text)
        text.add_child(_label(word.en, 40, INK))
        text.add_child(_label(word.uk, 27, MUTED))
        var voice := _button("Звук", _speak.bind(word.en), false, 80)
        voice.add_theme_font_size_override("font_size", 24)
        voice.custom_minimum_size.x = 112
        voice.size_flags_vertical = Control.SIZE_SHRINK_CENTER
        voice.tooltip_text = "Прослухати англійською: " + word.en
        row.add_child(voice)
    _gap(page, 6)
    page.add_child(_button("Знайти пари", _start_matching, true, 92))
    page.add_child(_label("У грі обери малюнок і відповідне англійське слово.\nУсі плитки мають однакове тло — без підказок.", 24, MUTED, true))
    _announce("Знайомство. Water — вода. Tea — чай. Coffee — кава. Milk — молоко.")

func _start_matching() -> void:
    lesson = Lesson.new()
    _new_page("matching")
    page.add_child(_label("Знайди пару", 50, RUST))
    var status_row := HBoxContainer.new()
    page.add_child(status_row)
    var hint := _label("Малюнок + англійське слово", 25, MUTED)
    hint.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    status_row.add_child(hint)
    pair_count = _label("0 / 4", 29, OLIVE)
    pair_count.autowrap_mode = TextServer.AUTOWRAP_OFF
    pair_count.custom_minimum_size.x = 90
    status_row.add_child(pair_count)
    pair_bar = _progress_bar(4, 0)
    page.add_child(pair_bar)
    _gap(page, 4)
    var grid := GridContainer.new()
    grid.columns = 2
    grid.add_theme_constant_override("h_separation", 18)
    grid.add_theme_constant_override("v_separation", 16)
    page.add_child(grid)
    for row in range(4):
        grid.add_child(_card("picture", lesson.pictures[row]))
        grid.add_child(_card("word", lesson.words[row]))
    feedback = _label("Обери будь-який малюнок або слово.", 26, MUTED, true)
    feedback.custom_minimum_size.y = 64
    feedback.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    page.add_child(feedback)
    _spacer(page)
    page.add_child(_label("Помилилась? Спробуй іншу пару.\nМи тут, щоб навчитись.", 22, MUTED, true))
    _announce("Знайди пару. Знайдено 0 з 4 пар.")

func _card(kind: String, index: int) -> Button:
    var card := _button(Lesson.WORDS[index].en if kind == "word" else "", _choose.bind(kind, index), false, 164)
    card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    card.add_theme_font_size_override("font_size", 44)
    card.set_meta("kind", kind)
    card.set_meta("word_index", index)
    if kind == "picture":
        var picture := TextureRect.new()
        picture.texture = textures[index]
        picture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
        picture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
        picture.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
        picture.position = Vector2(-69, -69)
        picture.size = Vector2(138, 138)
        picture.mouse_filter = Control.MOUSE_FILTER_IGNORE
        card.add_child(picture)
    card_buttons.append(card)
    return card

func _choose(kind: String, index: int) -> void:
    if locked or screen != "matching":
        return
    var old_kind: String = lesson.selected_kind
    var old_index: int = lesson.selected_id
    var result: String = lesson.choose(kind, index)
    _refresh_cards()
    if result in ["selected", "deselected"]:
        feedback.text = "Тепер обери відповідну пару." if result == "selected" else "Обери малюнок або слово."
        feedback.add_theme_color_override("font_color", MUTED)
    elif result == "wrong":
        locked = true
        feedback.text = "Поки не пара. Спробуй ще раз — усе вийде."
        feedback.add_theme_color_override("font_color", RUST)
        for card in card_buttons:
            if (card.get_meta("kind") == kind and card.get_meta("word_index") == index) or (card.get_meta("kind") == old_kind and card.get_meta("word_index") == old_index):
                _card_style(card, RED, Color("c28a72"))
        var serial: int = round_serial
        await get_tree().create_timer(0.65).timeout
        if screen == "matching" and serial == round_serial:
            locked = false
            _refresh_cards()
    elif result in ["matched", "complete"]:
        pair_count.text = "%s / 4" % lesson.found.size()
        create_tween().tween_property(pair_bar, "value", lesson.found.size(), 0.25)
        feedback.text = "%s — %s. Правильно!" % [Lesson.WORDS[index].en, Lesson.WORDS[index].uk]
        feedback.add_theme_color_override("font_color", OLIVE)
        _announce("Знайдено %s з 4 пар." % lesson.found.size())
        if result == "complete":
            locked = true
            # Apply one reward atomically before leaving this completed board.
            last_reward = progress.complete_round()
            progress.save()
            var serial: int = round_serial
            await get_tree().create_timer(0.8).timeout
            if screen == "matching" and serial == round_serial:
                _show_result()

func _refresh_cards() -> void:
    for card in card_buttons:
        var index: int = card.get_meta("word_index")
        var matched: bool = lesson.found.has(index)
        var selected: bool = lesson.selected_id == index and lesson.selected_kind == card.get_meta("kind")
        card.disabled = matched
        _card_style(card, GREEN if matched else Color("f8edcd") if selected else PAPER, OLIVE if matched else GOLD if selected else BORDER)
        if matched and not card.has_meta("tick"):
            var tick := Control.new()
            tick.mouse_filter = Control.MOUSE_FILTER_IGNORE
            tick.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
            tick.position = Vector2(-42, 10)
            tick.size = Vector2(32, 38)
            tick.draw.connect(_draw_check.bind(tick))
            card.add_child(tick)
            card.set_meta("tick", true)

func _show_result() -> void:
    _new_page("result")
    page.add_child(_label("Чудово попрацювала!", 48, RUST, true))
    page.add_child(_label("Усі чотири пари знайдено.", 28, MUTED, true))
    var garden = Garden.new()
    garden.stage = progress.rounds
    garden.custom_minimum_size = Vector2(0, 440)
    page.add_child(garden)
    garden.grow_in()
    var reward_panel := _panel(Color("e8edd9"), Color("ced9b9"))
    var rewards := _panel_content(reward_panel, 24)
    page.add_child(reward_panel)
    var messages: Array[String] = ["", "У саду виріс перший паросток", "Паросток випустив нові листочки", "Твій соняшник розквітнув!"]
    rewards.add_child(_label(messages[progress.rounds], 32, OLIVE, true))
    rewards.add_child(_label("+4 листки · раунд %s із 3" % progress.rounds if last_reward else "Тренування завершено · сад уже розквітнув", 26, INK, true))
    rewards.add_child(_label("Помилок: %s. Кожна спроба допомагає запам’ятати." % lesson.mistakes, 23, MUTED, true))
    page.add_child(_button("Повернутися в сад", _show_garden, true, 92))
    page.add_child(_button("Ще один раунд" if progress.rounds < 3 else "Потренувати ще", _start_matching, false, 80))
    page.add_child(_label("Прогрес збережено на цьому пристрої." if progress.storage_ok else "Прогрес є в цій грі, але збереження недоступне.", 23, MUTED, true))
    _announce("Раунд завершено. Ріст %s з 3. %s листків." % [progress.rounds, progress.leaves()])

func _card_style(card: Button, color: Color, line: Color) -> void:
    for state in ["normal", "hover", "pressed", "disabled"]:
        card.add_theme_stylebox_override(state, _style(color, line))

func _draw_check(mark: Control) -> void:
    mark.draw_polyline(PackedVector2Array([Vector2(3, 16), Vector2(12, 24), Vector2(28, 5)]), OLIVE, 4.0, true)

func _label(text: String, font_size: int = 28, color: Color = INK, centered: bool = false) -> Label:
    var label := Label.new()
    label.text = text
    label.add_theme_font_size_override("font_size", font_size)
    label.add_theme_color_override("font_color", color)
    label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    if centered:
        label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    return label

func _style(color: Color, border: Color) -> StyleBoxFlat:
    var style := StyleBoxFlat.new()
    style.bg_color = color
    style.border_color = border
    style.set_border_width_all(2)
    style.set_corner_radius_all(22)
    style.shadow_color = Color(0.35, 0.28, 0.12, 0.08)
    style.shadow_size = 4
    style.shadow_offset = Vector2(0, 3)
    for side in [SIDE_LEFT, SIDE_RIGHT]:
        style.set_content_margin(side, 18)
    style.set_content_margin(SIDE_TOP, 10)
    style.set_content_margin(SIDE_BOTTOM, 10)
    return style

func _button(text: String, callback: Callable, primary: bool = false, height_value: float = 80) -> Button:
    var button := Button.new()
    button.text = text
    button.custom_minimum_size.y = height_value
    button.add_theme_font_size_override("font_size", 29)
    var color: Color = OLIVE if primary else PAPER
    var ink_color: Color = PAPER if primary else INK
    var border: Color = OLIVE if primary else BORDER
    button.add_theme_stylebox_override("normal", _style(color, border))
    button.add_theme_stylebox_override("hover", _style(color.lightened(0.07), GOLD))
    button.add_theme_stylebox_override("pressed", _style(color.darkened(0.05), GOLD))
    button.add_theme_stylebox_override("disabled", _style(color, border))
    var focus := StyleBoxFlat.new()
    focus.bg_color = Color.TRANSPARENT
    focus.border_color = GOLD
    focus.set_border_width_all(4)
    focus.set_corner_radius_all(22)
    button.add_theme_stylebox_override("focus", focus)
    for state in ["font_color", "font_hover_color", "font_pressed_color", "font_disabled_color", "font_focus_color"]:
        button.add_theme_color_override(state, ink_color)
    button.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
    button.pressed.connect(callback)
    return button

func _panel(color: Color, border: Color) -> PanelContainer:
    var panel := PanelContainer.new()
    panel.add_theme_stylebox_override("panel", _style(color, border))
    return panel

func _panel_content(panel: PanelContainer, padding: int) -> VBoxContainer:
    var margin := MarginContainer.new()
    for side in ["left", "right", "top", "bottom"]:
        margin.add_theme_constant_override("margin_" + side, padding)
    panel.add_child(margin)
    var box := VBoxContainer.new()
    box.add_theme_constant_override("separation", 12)
    margin.add_child(box)
    return box

func _progress_bar(maximum: int, value: int) -> ProgressBar:
    var bar := ProgressBar.new()
    bar.max_value = maximum
    bar.value = value
    bar.show_percentage = false
    bar.custom_minimum_size.y = 16
    var background := StyleBoxFlat.new()
    background.bg_color = Color("e5dfcd")
    background.set_corner_radius_all(8)
    var fill := StyleBoxFlat.new()
    fill.bg_color = Color("8caa59")
    fill.set_corner_radius_all(8)
    bar.add_theme_stylebox_override("background", background)
    bar.add_theme_stylebox_override("fill", fill)
    return bar

func _gap(box: VBoxContainer, height_value: float) -> void:
    var gap := Control.new()
    gap.custom_minimum_size.y = height_value
    box.add_child(gap)

func _spacer(box: VBoxContainer) -> void:
    var spacer := Control.new()
    spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
    box.add_child(spacer)

func _speak(word: String) -> void:
    if OS.has_feature("web"):
        JavaScriptBridge.eval("window.wordCottageSpeak && window.wordCottageSpeak(" + JSON.stringify(word) + ")", true)
    elif DisplayServer.has_feature(DisplayServer.FEATURE_TEXT_TO_SPEECH):
        var voices: PackedStringArray = DisplayServer.tts_get_voices_for_language("en")
        if not voices.is_empty():
            DisplayServer.tts_stop()
            DisplayServer.tts_speak(word, voices[0], 85, 1.0, 0.85)

func _stop_audio() -> void:
    if OS.has_feature("web"):
        JavaScriptBridge.eval("if (window.speechSynthesis) window.speechSynthesis.cancel();", true)
    elif DisplayServer.has_feature(DisplayServer.FEATURE_TEXT_TO_SPEECH):
        DisplayServer.tts_stop()

func _announce(message: String) -> void:
    if OS.has_feature("web"):
        JavaScriptBridge.eval("window.wordCottageStatus && window.wordCottageStatus(" + JSON.stringify(message) + ")", true)

func _unhandled_key_input(event: InputEvent) -> void:
    if event.is_action_pressed("ui_cancel") and screen != "garden":
        _show_garden()
        get_viewport().set_input_as_handled()

func _notification(what: int) -> void:
    if what == NOTIFICATION_RESIZED:
        _resize_margins()

func _resize_margins() -> void:
    if is_instance_valid(page_host):
        var side: int = maxi(30, roundi((size.x - 720.0) / 2.0) + 30)
        page_host.add_theme_constant_override("margin_left", side)
        page_host.add_theme_constant_override("margin_right", side)

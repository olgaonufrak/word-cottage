extends SceneTree

const Lesson = preload("res://scripts/lesson.gd")
const Progress = preload("res://scripts/progress.gd")
var failures: int = 0
var checks: int = 0

func _initialize() -> void:
    _run.call_deferred()

func _run() -> void:
    for seed_value in range(100):
        var board = Lesson.new(seed_value)
        var picture_ids: Array[int] = board.pictures.duplicate()
        var word_ids: Array[int] = board.words.duplicate()
        picture_ids.sort()
        word_ids.sort()
        expect(picture_ids == [0, 1, 2, 3] and word_ids == [0, 1, 2, 3], "Both columns contain each word once")
        for i in range(4):
            expect(board.pictures[i] != board.words[i], "No initial same-row answer cue")
    var board = Lesson.new(37)
    expect(board.choose("picture", 0) == "selected", "Select image")
    expect(board.choose("word", 1) == "wrong", "Reject wrong answer")
    expect(board.found.size() == 0 and board.mistakes == 1, "Mistake never advances progress")
    expect(board.choose("word", 2) == "selected", "Word-first selection works")
    expect(board.choose("word", 3) == "selected", "Switch selection on same side")
    expect(board.choose("word", 3) == "deselected", "Repeat click deselects")
    expect(board.choose("unknown", 0) == "ignored", "Reject invalid side")
    expect(board.choose("picture", -1) == "ignored", "Reject invalid word")
    for i in range(4):
        board.choose("picture", i)
        expect(board.choose("word", i) == ("complete" if i == 3 else "matched"), "Correct pairs complete board exactly once")
        expect(board.choose("picture", i) == "ignored", "Matched card cannot complete twice")
    expect(board.found.size() == 4, "Four unique matched words")

    var progress = Progress.new("res://.godot/prototype-test-save.json")
    for bad in [null, [], "broken", {"version": 2, "rounds": 2}, {"version": 1, "rounds": "2"}, {"version": 1, "rounds": -4}]:
        progress.restore(bad)
        expect(progress.rounds == 0 and progress.leaves() == 0, "Invalid state recovers safely")
    progress.restore({"version": 1, "rounds": 99})
    expect(progress.rounds == 3 and progress.leaves() == 12, "Reward cap protects save")
    expect(not progress.complete_round(), "Practice cannot farm rewards")
    progress.restore({"version": 1, "rounds": 0})
    for i in range(3):
        expect(progress.complete_round(), "First three rounds grow garden")
        expect(progress.rounds == i + 1 and progress.leaves() == (i + 1) * 4, "Exactly four leaves per growth stage")
    expect(not progress.complete_round(), "No fourth growth reward")
    expect(progress.save(), "Save own isolated test file")
    var restored = Progress.new("res://.godot/prototype-test-save.json")
    restored.load_save()
    expect(restored.rounds == 3 and restored.leaves() == 12, "Progress survives reload")

    var app = load("res://main.tscn").instantiate()
    root.add_child(app)
    await process_frame
    app.progress = Progress.new(progress.save_path)
    app._show_garden()
    await process_frame
    expect(app.page.get_combined_minimum_size().y <= app.page_host.size.y, "Garden fits base viewport")
    app._show_intro()
    await process_frame
    expect(app.page.get_combined_minimum_size().y <= app.page_host.size.y, "Introduction fits base viewport")
    app._start_matching()
    await process_frame
    expect(app.page.get_combined_minimum_size().y <= app.page_host.size.y, "Matching board fits base viewport")
    app._choose("picture", 0)
    app._choose("word", 1)
    expect(app.progress.rounds == 0, "Wrong UI answer never grants reward")
    app._show_garden()
    await create_timer(0.7).timeout
    expect(app.screen == "garden" and not app.locked, "Leaving during feedback cancels old callback")
    app._start_matching()
    await process_frame
    for i in range(3):
        app._choose("word", i)
        app._choose("picture", i)
    expect(app.progress.rounds == 0, "Partial UI board cannot earn reward")
    app._choose("word", 3)
    app._choose("picture", 3)
    expect(app.progress.rounds == 1 and app.progress.leaves() == 4, "Complete UI board grants exactly one reward")
    app._choose("word", 3)
    expect(app.progress.rounds == 1, "Fast repeat press cannot duplicate reward")
    await create_timer(0.85).timeout
    expect(app.screen == "result", "Completion opens result screen")
    await process_frame
    expect(app.page.get_combined_minimum_size().y <= app.page_host.size.y, "Result fits base viewport")
    app.queue_free()
    await process_frame
    DirAccess.remove_absolute(ProjectSettings.globalize_path(progress.save_path))
    print("Word Cottage Godot checks: %s checks; %s failures." % [checks, failures])
    quit(1 if failures else 0)

func expect(condition: bool, message: String) -> void:
    checks += 1
    if not condition:
        failures += 1
        push_error(message)

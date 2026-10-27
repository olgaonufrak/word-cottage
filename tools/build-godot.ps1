param(
    [Parameter(Mandatory = $true)][string]$Godot,
    [string]$WebTemplate = ''
)
$ErrorActionPreference = 'Stop'
$prototypeRoot = Join-Path $PSScriptRoot '..\godot-prototype'
$prototypeRoot = (Resolve-Path -LiteralPath $prototypeRoot).Path
$presetPath = Join-Path $prototypeRoot 'export_presets.cfg'
$outputRoot = Join-Path $PSScriptRoot '..\dist\godot-game'
$outputRoot = [System.IO.Path]::GetFullPath($outputRoot)
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$presetSource = [System.IO.File]::ReadAllText($presetPath)
try {
    if ($WebTemplate) {
        $templatePath = (Resolve-Path -LiteralPath $WebTemplate).Path.Replace('\', '/')
        if ($templatePath.Contains('"')) { throw 'Template path cannot contain quotes.' }
        $patchedPreset = $presetSource.Replace('custom_template/release=""', 'custom_template/release="' + $templatePath + '"')
        [System.IO.File]::WriteAllText($presetPath, $patchedPreset, [System.Text.UTF8Encoding]::new($false))
    }
    & $Godot --headless --path $prototypeRoot --editor --import
    if ($LASTEXITCODE -ne 0) { throw 'Godot resource import failed.' }
    & $Godot --headless --path $prototypeRoot --script tests/run.gd
    if ($LASTEXITCODE -ne 0) { throw 'Godot game checks failed.' }
    & $Godot --headless --path $prototypeRoot --export-release Web (Join-Path $outputRoot 'index.html')
    if ($LASTEXITCODE -ne 0) { throw 'Godot Web export failed.' }
    $htmlPath = Join-Path $outputRoot 'index.html'
    $htmlSource = [System.IO.File]::ReadAllText($htmlPath)
    $htmlSource = ([regex]::Replace($htmlSource, '(?m)[\t ]+$', '')).TrimEnd() + [System.Environment]::NewLine
    [System.IO.File]::WriteAllText($htmlPath, $htmlSource, [System.Text.UTF8Encoding]::new($false))
    Copy-Item -LiteralPath (Join-Path $prototypeRoot 'LICENSE_GODOT.txt'),(Join-Path $prototypeRoot 'COPYRIGHT_GODOT.txt') -Destination $outputRoot
} finally {
    [System.IO.File]::WriteAllText($presetPath, $presetSource, [System.Text.UTF8Encoding]::new($false))
}

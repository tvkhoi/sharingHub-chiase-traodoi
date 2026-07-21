$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docs = @(
    "DATABASE SPECIFICATION DOCUMENT",
    "BRD - Business Requirements Document",
    "SyRS - System requirements specification",
    "ARCHITECTURE DESIGN DOCUMENT",
    "DATABASE DESIGN DOCUMENT"
)
foreach ($d in $docs) {
    $path = "d:\asset-sharing-system\backend\Backend Asset Sharing\$d.docx"
    $out = "d:\asset-sharing-system\backend\$d.txt"
    $doc = $word.Documents.Open($path)
    $doc.SaveAs([ref]$out, [ref]2)
    $doc.Close()
    Write-Host "Converted: $d"
}
$word.Quit()
Write-Host "All done"

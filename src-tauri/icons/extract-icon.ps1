$src = 'C:\Windows\System32\cmd.exe'
if (Test-Path $src) {
  $ico = [System.Drawing.Icon]::ExtractAssociatedIcon($src)
  $fs = [IO.File]::Create('icon.ico')
  $ico.Save($fs)
  $fs.Close()
  $ico.Dispose()
  Write-Host 'SUCCESS: extracted real valid icon.ico from cmd.exe'
} else {
  Write-Host 'src not found, using previous'
}

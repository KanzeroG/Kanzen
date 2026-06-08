Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 16,16
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(18,18,20))
$g.Dispose()
$bmp.Save("icon.ico", [System.Drawing.Imaging.ImageFormat]::Icon)
$bmp.Dispose()
Write-Host "SUCCESS: valid icon.ico generated"

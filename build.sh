 # !/bin/bash
 
 pnpm tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc
 cp src-tauri/target/x86_64-pc-windows-msvc/release/ocuassist.exe ~/link/Desktop/
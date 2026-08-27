// Windows opens a console window behind a GUI app unless it is told not to.
// Only in release: in debug that console is where `println!` goes.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ders_programi_lib::run()
}

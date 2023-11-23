fx_version 'cerulean'

game "gta5"

author "Byte Labs"
version '1.0.0'
description 'Byte Labs UI'
repository 'https://github.com/Byte-Labs-Project/bl_ui'

lua54 'yes'

ui_page 'build/index.html'
-- ui_page 'http://localhost:3000/' --for dev

shared_script {
    'shared/**/*.lua',
}

client_script {
    'client/*.lua',
    'client/games/*.lua',
}

files {
    'build/**',
}

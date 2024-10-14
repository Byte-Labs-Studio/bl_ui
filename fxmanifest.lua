fx_version 'cerulean'

game "gta5"
use_experimental_fxv2_oal 'yes'
author "Byte Labs"
version '2.0.5'
description 'Byte Labs UI'
repository 'https://github.com/Byte-Labs-Project/bl_ui'

lua54 'yes'

ui_page 'build/index.html'
-- ui_page 'http://localhost:3000/' --for dev

client_script {
    'client/*.lua',
    'client/games/*.lua',
    'client/init.lua'
}

files {
    'build/**',
}

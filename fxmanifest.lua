fx_version 'cerulean'

game "gta5"

author "Byte Labs"
version '1.0.0'
description 'Byte Labs Svelte / CFX Lua template.'
repository 'https://github.com/Byte-Labs-Project/bl_svelte_template'

lua54 'yes'

ui_page 'build/index.html'
-- ui_page 'http://localhost:3000/' --for dev

shared_script {
    'shared/enums.lua'
}

server_script {
    -- 'server/server.lua',
}

client_script {
    'client/*.lua',
}

files {
    'build/**',
}

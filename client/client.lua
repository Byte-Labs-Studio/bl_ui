RegisterNUICallback(RECEIVE.close, function(_, cb)
    SendNUIEvent(SEND.visible, false)
    cb(1)
end)
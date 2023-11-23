--- Used to send NUI events to the UI
--- @param action string
--- @param data any
function SendNUIEvent(action, data)
    SendNUIMessage({
        action = action,
        data = data
    })
end

-- taken from ox_lib

local keepInput = IsNuiFocusKeepingInput()

--- Used to set the UI focus
--- @param allowInput boolean
--- @param disableCursor boolean
function SetUIFocus(allowInput, disableCursor)
    keepInput = IsNuiFocusKeepingInput()
    SetNuiFocus(true, not disableCursor)
    SetNuiFocusKeepInput(allowInput)
end

--- Used to reset the UI focus
function ResetUIFocus()
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(keepInput)
end
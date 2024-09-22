local currentGamePromise = nil
local loaded = false

RegisterNUICallback(Receive.finish, function(success, cb)
    if currentGamePromise then
        currentGamePromise:resolve(success)
        currentGamePromise = nil
        ResetUIFocus()
    end
    cb(1)
end)

RegisterNUICallback(Receive.uiLoaded, function(_, cb)
    loaded = true
    cb(1)
end)

local function isUILoaded()
    local timeout = 5000
    local elapsedTime = 0
    local interval = 100

    while not loaded and elapsedTime < timeout do
        Wait(interval)
        elapsedTime += interval
    end

    return loaded
end
--- The main function to start a game
---@param gameType string The type of game to start
---@param iterations number The amount of iterations to run
---@param config DifficultyConfig | KeyDifficultyConfig | LengthConfig | LevelConfig The config for the game
function StartGame(gameType, iterations, config)
    assert(isUILoaded(), 'UI loading timeout')
    
    if not gameType then
        print("No game type provided")
        return
    end

    if currentGamePromise then
        print("A game is already running, please wait for it to finish before starting a new one.")
        return
    end

    currentGamePromise = promise:new()

    SendNUIEvent(Send.visible, true)
    SendNUIEvent(Send.start, {
        type = gameType,
        iterations = iterations or 1,
        config = config,
    })

    local configInput = Config.KeepGameInput[gameType]
    local keepGameInput = false

    if configInput ~= nil then
        keepGameInput = configInput
    end

    local configCursor = Config.DisplayCursor[gameType]
    local displayCursor = false

    if configCursor ~= nil then
        displayCursor = configCursor
    end

    SetUIFocus(keepGameInput, displayCursor)

    local result = Citizen.Await(currentGamePromise)
	return result
end

function CancelGame()
    if currentGamePromise then
        currentGamePromise:resolve(false)
        currentGamePromise = nil
        ResetUIFocus()
    end
end
exports('CancelGame', CancelGame)

RegisterNUICallback(Receive.close, function(_, cb)
    SendNUIEvent(Send.visible, false)
    ResetUIFocus()
    cb(1)
end)

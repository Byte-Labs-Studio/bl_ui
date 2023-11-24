local currentGamePromise = nil

RegisterNUICallback(Receive.finish, function(success, cb)
    if currentGamePromise then
        currentGamePromise:resolve(success)
        currentGamePromise = nil
        ResetUIFocus()
    end
    cb(1)
end)

--- The main function to start a game
---@param gameType string The type of game to start
---@param iterations number The amount of iterations to run
---@param config DifficultyConfig | KeyDifficultyConfig The config for the game
function StartGame(gameType, iterations, config)

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

    local keepGameInput = Config.KeepGameInput[gameType] or false

    SetUIFocus(keepGameInput, true)

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

local function printLock(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.printLock, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("PrintLock", printLock)
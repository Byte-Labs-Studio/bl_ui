local function wordWiz(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.wordWiz, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("WordWiz", wordWiz)
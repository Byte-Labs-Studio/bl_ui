local function hexaPipe(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.hexaPipe, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("HexaPipe", hexaPipe)
local function untangle(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.untangle, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("Untangle", untangle)
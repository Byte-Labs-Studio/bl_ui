local function waveMatch(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.waveMatch, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("WaveMatch", waveMatch)
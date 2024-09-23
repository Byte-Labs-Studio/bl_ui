local function mineSweeper(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.mineSweeper, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("MineSweeper", mineSweeper)
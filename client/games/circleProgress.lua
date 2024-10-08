--- CircleProgress Game
---@param iterations number The amount of iterations to run
---@param difficulty number The difficulty of the game (1-100)
---@return boolean
local function circleProgress(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty,
    }

    local result = StartGame(GameTypes.circleProgress, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("CircleProgress", circleProgress)
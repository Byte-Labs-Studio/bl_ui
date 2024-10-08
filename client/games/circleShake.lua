--- CircleShake Game
---@param iterations number The amount of iterations to run
---@param difficulty number The difficulty of the game (1-100)]
---@param numberOfKeys number The amount of keys to break
---@return boolean
local function circleShake(iterations, difficulty, numberOfKeys)
    local promise = promise:new()

    ---@type KeyDifficultyConfig
    local config = {
        difficulty = difficulty or 50,
        numberOfKeys = numberOfKeys or 5,
    }

    local result = StartGame(GameTypes.CircleShake, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("CircleShake", circleShake)
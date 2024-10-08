--- RapidLines Game
---@param iterations number The amount of iterations to run
---@param difficulty number The difficulty of the game (1-100)]
---@param numberOfLines number The amount of keys to press
---@return boolean
local function rapidLines(iterations, difficulty, numberOfLines)
    local promise = promise:new()

    ---@type KeyDifficultyConfig
    local config = {
        difficulty = difficulty or 50,
        numberOfKeys = numberOfLines or 5,
    }

    local result = StartGame(GameTypes.rapidLines, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("RapidLines", rapidLines)
--- KeyCircle Game
---@param iterations number The amount of iterations to run
---@param difficulty number The difficulty of the game (1-100)]
---@param numberOfKeys number The amount of keys to press
---@return boolean
local function keyCircle(iterations, difficulty, numberOfKeys)
    local promise = promise:new()

    ---@type KeyDifficultyConfig
    local config = {
        difficulty = difficulty or 50,
        numberOfKeys = numberOfKeys or 3,
    }

    local result = StartGame(GameTypes.keyCircle, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("KeyCircle", keyCircle)
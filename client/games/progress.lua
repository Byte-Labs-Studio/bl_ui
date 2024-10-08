--- Progress Game
---@param iterations number The amount of iterations to run
---@param difficulty number The difficulty of the game (1-100)
---@return boolean
local function progress(iterations, difficulty)
    local promise = promise:new()

    ---@type DifficultyConfig
    local config = {
        difficulty = difficulty or 50,
    }

    local result = StartGame(GameTypes.progress, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("Progress", progress)
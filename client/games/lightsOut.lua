---@param iterations number The amount of iterations to run
---@param config LevelConfig
local function lightsOut(iterations, config)
    local promise = promise:new()

    local result = StartGame(GameTypes.lightsOut, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("LightsOut", lightsOut)
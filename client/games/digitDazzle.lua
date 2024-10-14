---@param iterations number The amount of iterations to run
---@param config InputConfig
local function digitDazzle(iterations, config)
    local promise = promise:new()

    local result = StartGame(GameTypes.digitDazzle, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("DigitDazzle", digitDazzle)
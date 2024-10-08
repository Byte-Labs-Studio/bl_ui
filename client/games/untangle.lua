---@param iterations number The amount of iterations to run
---@param config NodeConfig
local function untangle(iterations, config)
    local promise = promise:new()

    local result = StartGame(GameTypes.untangle, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("Untangle", untangle)
---@param iterations number The amount of iterations to run
---@param config GridConfig
local function printLock(iterations, config)
    local promise = promise:new()

    local result = StartGame(GameTypes.printLock, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("PrintLock", printLock)


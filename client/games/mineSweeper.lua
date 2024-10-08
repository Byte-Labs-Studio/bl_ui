---@param iterations number The amount of iterations to run
---@param config GridConfig
local function mineSweeper(iterations, config)
    local promise = promise:new()

    local result = StartGame(GameTypes.mineSweeper, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("MineSweeper", mineSweeper)
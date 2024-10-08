---@param iterations number The amount of iterations to run
---@param config LengthConfig
local function wordWiz(iterations, config)
    local promise = promise:new()

    local result = StartGame(GameTypes.wordWiz, iterations, config)
    promise:resolve(result)

    return Citizen.Await(promise)
end
exports("WordWiz", wordWiz)
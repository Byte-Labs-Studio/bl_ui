---@alias MainFunctionConfig DifficultyConfig | KeyDifficultyConfig | LengthConfig | LevelConfig | GridConfig | NodeConfig

---@class DifficultyConfig
---@field difficulty number The difficulty of the game (1-100)

---@class KeyDifficultyConfig
---@field difficulty number The difficulty of the game (1-100)
---@field numberOfKeys number The amount of keys to press

---@class LengthConfig
---@field length number The length of the circle's cuts
---@field duration number duration before game closes

---@class InputConfig : LengthConfig
---@field code? string[] Required if length is not defined
---@field length? number Required if code is not defined

---@class LevelConfig
---@field level number The length of the circle's cuts
---@field duration number duration before game closes

---@class GridConfig
---@field grid number The length of the circle's cuts
---@field duration number duration before game closes
---@field target number duration before game closes

---@class NodeConfig
---@field numberOfNodes number The length of the circle's cuts
---@field duration number duration before game closes
---@field previewDuration? number for mineSweeper: preview duration (time for red mines preview to hide)
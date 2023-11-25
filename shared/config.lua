Config = {}

GameTypes = {
    CircleProgress = "CircleProgress",
    Progress = "Progress",
    KeyCircle = "KeyCircle",
    KeySpam = "KeySpam",
    NumberSlide = "NumberSlide",
    RapidLines = "RapidLines",
}

Config.KeepGameInput = {
    [GameTypes.CircleProgress] = true,
    [GameTypes.Progress] = true,
    [GameTypes.KeyCircle] = false,
    [GameTypes.KeySpam] = true,
    [GameTypes.NumberSlide] = true,
    [GameTypes.RapidLines] = true,
}
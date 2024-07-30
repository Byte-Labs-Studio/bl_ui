Config = {}

GameTypes = {
    CircleProgress = "CircleProgress",
    Progress = "Progress",
    KeyCircle = "KeyCircle",
    KeySpam = "KeySpam",
    NumberSlide = "NumberSlide",
    RapidLines = "RapidLines",
    CircleShake = "CircleShake",
    PathFind = "PathFind",
}

Config.KeepGameInput = {
    [GameTypes.CircleProgress] = true,
    [GameTypes.Progress] = true,
    [GameTypes.KeySpam] = true,
    [GameTypes.NumberSlide] = true,
    [GameTypes.RapidLines] = true,
}

Config.DisplayCursor = {
    [GameTypes.CircleShake] = true,
    [GameTypes.PathFind] = true,
}
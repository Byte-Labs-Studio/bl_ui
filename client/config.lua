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

    circleSum = "CircleSum",
    digitDazzle = "DigitDazzle",
    hexaPipe = "HexaPipe",
    lightsOut = "LightsOut",
    mineSweeper = "MineSweeper",
    printLock = "PrintLock",
    untangle = "Untangle",
    waveMatch = "WaveMatch",
    wordWiz = "WordWiz",
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
    [GameTypes.circleSum] = true,
    [GameTypes.digitDazzle] = true,
    [GameTypes.lightsOut] = true,
}
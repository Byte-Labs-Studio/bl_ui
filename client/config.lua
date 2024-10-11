Config = {}

GameTypes = {
    circleProgress = "CircleProgress",
    progress = "Progress",
    keyCircle = "KeyCircle",
    keySpam = "KeySpam",
    numberSlide = "NumberSlide",
    rapidLines = "RapidLines",
    circleShake = "CircleShake",
    pathFind = "PathFind",

    circleSum = "CircleSum",
    digitDazzle = "DigitDazzle",
    -- hexaPipe = "HexaPipe",
    lightsOut = "LightsOut",
    mineSweeper = "MineSweeper",
    printLock = "PrintLock",
    untangle = "Untangle",
    waveMatch = "WaveMatch",
    wordWiz = "WordWiz",
}

Config.KeepGameInput = {
    [GameTypes.circleProgress] = true,
    [GameTypes.progress] = true,
    [GameTypes.keySpam] = true,
    [GameTypes.numberSlide] = true,
    [GameTypes.rapidLines] = true,
}

Config.DisplayCursor = {
    [GameTypes.circleShake] = true,
    [GameTypes.pathFind] = true,
    [GameTypes.circleSum] = true,
    [GameTypes.digitDazzle] = true,
    [GameTypes.lightsOut] = true,
    [GameTypes.mineSweeper] = true,
    [GameTypes.printLock] = true,
    [GameTypes.untangle] = true,
    [GameTypes.waveMatch] = true,
    [GameTypes.wordWiz] = true,
}
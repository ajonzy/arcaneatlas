export const templateSizes = src => {
    switch (src) {
        case "burst5": return { width: 100, height: 100 }
        case "emanation5":
        case "coneN15":
        case "coneNE15":
        case "coneE15":
        case "coneSE15":
        case "coneS15":
        case "coneSW15":
        case "coneW15":
        case "coneNW15": return { width: 150, height: 150 }
        case "emanationLarge5":
        case "burst10":
        case "lineNE30":
        case "lineSE30":
        case "lineSW30":
        case "lineNW30": return { width: 200, height: 200 }
        case "emanation10": return { width: 250, height: 250 }
        case "emanationLarge10": 
        case "coneNE30": 
        case "coneSE30": 
        case "coneSW30": 
        case "coneNW30": 
        case "burst15": return { width: 300, height: 300 }
        case "burst20": 
        case "lineNE60": 
        case "lineSE60": 
        case "lineSW60": 
        case "lineNW60": return { width: 400, height: 400 } 
        case "coneNE60": 
        case "coneSE60": 
        case "coneSW60": 
        case "coneNW60": 
        case "burst30": return { width: 600, height: 600 } 
        case "coneN30": 
        case "coneS30": return { width: 400, height: 300 } 
        case "coneE30": 
        case "coneW30": return { width: 300, height: 400 }
        case "coneN60": 
        case "coneS60": return { width: 800, height: 600 }
        case "coneE60": 
        case "coneW60": return { width: 600, height: 800 }
        case "lineN30": 
        case "lineS30": return { width: 50, height: 300 }
        case "lineE30": 
        case "lineW30": return { width: 300, height: 50 }
        case "lineNNE30": 
        case "lineSSE30": 
        case "lineSSW30": 
        case "lineNNW30": return { width: 100, height: 300 }
        case "lineEEN30": 
        case "lineEES30": 
        case "lineWWS30": 
        case "lineWWN30": return { width: 300, height: 100 }
        case "lineNEE30": 
        case "lineSEE30": 
        case "lineSWW30": 
        case "lineNWW30": return { width: 150, height: 250 }
        case "lineENN30": 
        case "lineESS30": 
        case "lineWSS30": 
        case "lineWNN30": return { width: 250, height: 150 }
        case "lineN60": 
        case "lineS60": return { width: 50, height: 600 }
        case "lineE60": 
        case "lineW60": return { width: 600, height: 50 }
        case "lineNNE60": 
        case "lineSSE60": 
        case "lineSSW60": 
        case "lineNNW60": return { width: 200, height: 550 } 
        case "lineEEN60": 
        case "lineEES60": 
        case "lineWWS60": 
        case "lineWWN60": return { width: 550, height: 200 }
        case "lineNEE60": 
        case "lineSEE60": 
        case "lineSWW60": 
        case "lineNWW60": return { width: 250, height: 500 }
        case "lineENN60": 
        case "lineESS60": 
        case "lineWSS60": 
        case "lineWNN60": return { width: 500, height: 250 }
    }
}
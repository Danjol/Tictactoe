import { ANSI } from './ansi.mjs';

const { RED, YELLOW, GREEN, BLUE } = ANSI.COLOR;
const ART = `
${RED} ______  ____   __      ______   ____    __      ______   ___     ___${ANSI.RESET}
${YELLOW}|      ||    | /  ]    |      | /    |  /  ]    |      | /   \\   /  _]${ANSI.RESET}
${GREEN}|      | |  | /  /     |      ||  o  | /  /     |      ||     | /  [_${ANSI.RESET}
${BLUE}|_|  |_| |  |/  /      |_|  |_||     |/  /      |_|  |_||  O  ||    _]${ANSI.RESET}
${RED}  |  |   |  /   \\_       |  |  |  _  /   \\_       |  |  |     ||   [_${ANSI.RESET}
${YELLOW}  |  |   |  \\     |      |  |  |  |  \\     |      |  |  |     ||     |${ANSI.RESET}
${GREEN}  |__|  |____\\____|      |__|  |__|__|\\____|      |__|   \\___/ |_____|${ANSI.RESET}
`

function showSplashScreen() {
    console.log(ART);
}

export default showSplashScreen;

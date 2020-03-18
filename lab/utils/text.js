//Tab character indentation
let defaultTab = "    ";

//Text editor class
export class TextEditor {
    constructor(args) {
        this.target = args.target; // <--- target element
        //Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        //Add event listeners
        this.target.addEventListener("keydown", this.handleKeyDown);
        this.target.addEventListener("keyup", this.handleKeyUp);
        //Add new text
        if (args.content !== null) {
            this.target.textContent = args.content;
        }
    }
    //Remove event listeners
    destroy() {
        this.target.removeEventListener("keydown", this.handleKeyDown);
        this.target.removeEventListener("keyup", this.handleKeyUp);
    }
    //Handle key down listener
    handleKeyDown(event) {
        //Check for new line event
        if (event.keyCode === 13) {
            return this.handleNewlineDown(event);
        }
        //Check for backspace key
        else if (event.keyCode === 8) {
            return this.handleBackspaceDown(event);
        }
        //Check for tab key
        else if (event.keyCode === 9) {
            return this.handleTabDown(event);
        }
    }
    //Handle key up listener
    handleKeyUp(event) {
        //TODO
    }
    //Handle tab key down
    handleTabDown(event) {
        event.preventDefault(); // <--- ignore tab character
        document.execCommand("insertHTML", false, defaultTab);
    }
    //Handle backspace down
    handleBackspaceDown(event) {
        let selection = document.getSelection();
        if (selection.type !== "Caret") {
            return null; // --> do nothing
        }
        let pos = selection.focusOffset;
        let text = this.getText();
        let textBefore = text.slice(0, pos);
        //Split the current text by \n and get the last line
        let lines = textBefore.split("\n");
        if (lines.length === 0) {
            return null; // --> do nothing
        }
        let line = lines[lines.length - 1]; //Get the current line --> the last one
        //Check for not only space characters or empty line
        if (line.trim() !== "" || line === "") {
            return null; // --> do nothing
        }
        //Prevent default --> we will remove at least 4 blank spaces (a tab)
        event.preventDefault();
        let removeChars = (line.length % 4 === 0) ? 4 : line.length % 4;
        this.setText(text.substring(0, pos - removeChars) + text.substring(pos, text.length));
        //Move the caret
        let range = document.createRange();
        range.collapse(true);
        range.setStart(this.target.childNodes[0], pos - removeChars);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    //Handle new line down
    handleNewlineDown(event) {
        //Get the current selection and current text
        let selection = document.getSelection();
        //Get the last line
        let lines = this.getTextBefore().split("\n");
        let lastLine = lines[lines.length - 1];
        //Get the lst indentation and the last character
        let lastIndentation = /^([\s]*)/.exec(lastLine);
        let lastChar = lastLine.trim().slice(-1);
        //Check for no last indentation character
        if (lastIndentation === null || typeof lastIndentation[0] !== "string") {
            return null; // <--- Add new line without indentation
        }
        let indentation = lastIndentation[0]; // Default indentation
        //Check if the last character is a new object or array indicator
        if (lastChar === "{" || lastChar === "[") {
            indentation = lastIndentation[0] + defaultTab;
        }
        event.preventDefault(); // <<-- Prevent newline
        document.execCommand("insertHTML", false, "\n" + indentation);
    }
    //Set the text
    setText(content) {
        this.target.textContent = content;
    }
    //Get all text
    getText() {
        return this.target.textContent;
    }
    //Get lines
    getLines() {
        return this.target.textContent.split("\n");
    }
    //Get text before current caret position
    getTextBefore() {
        return this.getText().slice(0, document.getSelection().focusOffset);
    }
    //Get text after current caret position
    getTextAfter() {
        //return this.getText().slice(0, document.getSelection().focusOffset);
        return "";
    }
}

